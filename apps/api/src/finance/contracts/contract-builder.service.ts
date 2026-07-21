import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import type {
  GenerateContractInput,
  ContractTemplateResult,
  ApprovalRequestItem,
  ApprovalStatus,
} from '@betflow/shared';

@Injectable()
export class ContractBuilderService {
  private readonly approvalStore = new Map<string, ApprovalRequestItem>();

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Generates a legal Ethiopian Real Estate Sales Agreement & evaluates approval rules.
   */
  async generateContract(
    userId: string,
    input: GenerateContractInput,
  ): Promise<ContractTemplateResult> {
    const { customerId, unitId, agreedPrice, currency, discountPercent = 0, specialTerms } = input;

    const [customer, unit] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: customerId } }),
      this.prisma.unit.findUnique({
        where: { id: unitId },
        include: { floor: { include: { building: { include: { project: true } } } } },
      }),
    ]);

    if (!customer) throw new NotFoundException(`Customer ${customerId} not found`);
    if (!unit) throw new NotFoundException(`Unit ${unitId} not found`);

    // Multi-level approval rules
    let requiresApproval = false;
    let approvalReason = '';

    if (discountPercent > 5) {
      requiresApproval = true;
      approvalReason += `Custom discount of ${discountPercent}% exceeds 5% threshold. `;
    }

    const priceUsdEquivalent = currency === 'USD' ? agreedPrice : agreedPrice / 120;
    if (priceUsdEquivalent > 500000) {
      requiresApproval = true;
      approvalReason += `Contract value exceeding $500,000 USD / 60M ETB requires Executive Approval.`;
    }

    const approvalStatus: ApprovalStatus = requiresApproval ? 'PENDING' : 'APPROVED';

    // Create contract in database
    const contract = await this.prisma.contract.create({
      data: {
        customerId,
        unitId,
        startDate: new Date(),
        totalAmt: agreedPrice,
        status: requiresApproval ? 'PENDING_APPROVAL' : 'ACTIVE',
      },
    });

    const buyerName = `${customer.firstName} ${customer.lastName}`;
    const unitNumber = unit.unitNumber;
    const buildingName = unit.floor.building.name;
    const projectName = unit.floor.building.project.name;

    // Generate HTML Legal Contract Content
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; padding: 30px; line-height: 1.6; color: #111;">
        <div style="text-align: center; border-b: 2px solid #111; padding-bottom: 15px; margin-bottom: 25px;">
          <h1 style="font-size: 22px; margin: 0; text-transform: uppercase;">ETHIOPIAN REAL ESTATE PROPERTY SALE AGREEMENT</h1>
          <p style="font-size: 13px; color: #555; margin-top: 5px;">የውልና ማስረጃ ውል ስምምነት — ${projectName}</p>
        </div>

        <p><strong>THIS AGREEMENT</strong> is made on <strong>${new Date().toLocaleDateString()}</strong> between:</p>
        <p><strong>DEVELOPER (SELLER):</strong> BetFlow Real Estate Development S.C., Addis Ababa, Ethiopia.</p>
        <p><strong>BUYER (PURCHASER):</strong> <strong>${buyerName}</strong> (Email: ${customer.email || 'N/A'}, Phone: ${customer.phone || 'N/A'}).</p>

        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">1. PROPERTY DETAILS</h3>
        <p>The Seller agrees to sell and the Buyer agrees to purchase Unit Number <strong>${unitNumber}</strong> (${unit.type}), located on <strong>${unit.floor.name || `Floor ${unit.floor.floorNumber}`}</strong> of <strong>${buildingName}</strong> within the <strong>${projectName}</strong> project.</p>

        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">2. PURCHASE PRICE & PAYMENT TERMS</h3>
        <p>The total agreed purchase price for the property is <strong>${agreedPrice.toLocaleString()} ${currency}</strong> (Discount Applied: ${discountPercent}%).</p>

        <h3 style="border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 20px;">3. SPECIAL STIPULATIONS</h3>
        <p>${specialTerms || 'Standard construction milestone payment schedule applies. Final key handover and title deed (Carta) transfer upon full payment completion.'}</p>

        <div style="margin-top: 40px; display: flex; justify-content: space-between; border-top: 1px solid #aaa; padding-top: 20px;">
          <div>
            <p>_____________________________________</p>
            <p><strong>Seller Representative (BetFlow Real Estate)</strong></p>
          </div>
          <div>
            <p>_____________________________________</p>
            <p><strong>Buyer Signature (${buyerName})</strong></p>
          </div>
        </div>
      </div>
    `;

    // If approval is required, register approval request item
    if (requiresApproval) {
      const approvalId = `appr_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
      const approvalItem: ApprovalRequestItem = {
        id: approvalId,
        contractId: contract.id,
        title: `Contract Approval: ${buyerName} — Unit ${unitNumber}`,
        requesterName: 'Sales Agent',
        buyerName,
        amount: agreedPrice,
        currency,
        discountPercent,
        reason: approvalReason,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      this.approvalStore.set(approvalId, approvalItem);

      // Create notification
      await this.prisma.notification.create({
        data: {
          userId,
          title: `⏳ Contract Pending Approval`,
          message: `Contract for buyer ${buyerName} requires management approval. Reason: ${approvalReason}`,
        },
      });
    }

    // Audit Log
    await this.prisma.auditLog.create({
      data: {
        userId,
        action: 'contract.generated',
        entityType: 'Contract',
        entityId: contract.id,
        newValues: {
          buyerName,
          unitNumber,
          agreedPrice,
          currency,
          requiresApproval,
        },
      },
    });

    return {
      contractId: contract.id,
      title: `Sale Agreement — Unit ${unitNumber} (${buyerName})`,
      buyerName,
      unitNumber,
      buildingName,
      agreedPrice,
      currency,
      discountPercent,
      requiresApproval,
      approvalReason: approvalReason || undefined,
      approvalStatus,
      htmlContent,
    };
  }

  /**
   * Returns all pending contract approval requests for managers.
   */
  async listPendingApprovals(): Promise<ApprovalRequestItem[]> {
    return Array.from(this.approvalStore.values());
  }

  /**
   * Reviews and approves/rejects a pending contract.
   */
  async reviewApproval(userId: string, approvalId: string, action: 'APPROVE' | 'REJECT') {
    const item = this.approvalStore.get(approvalId);
    if (!item) {
      throw new NotFoundException(`Approval request ${approvalId} not found`);
    }

    item.status = action === 'APPROVE' ? 'APPROVED' : 'REJECTED';
    this.approvalStore.set(approvalId, item);

    // Update contract status in database
    await this.prisma.contract.update({
      where: { id: item.contractId },
      data: { status: action === 'APPROVE' ? 'ACTIVE' : 'REJECTED' },
    });

    await this.prisma.auditLog.create({
      data: {
        userId,
        action: action === 'APPROVE' ? 'contract.approved' : 'contract.rejected',
        entityType: 'Contract',
        entityId: item.contractId,
      },
    });

    return item;
  }
}
