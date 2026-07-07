export declare const UNIT_STATUSES: readonly ["AVAILABLE", "RESERVED", "SOLD"];
export type UnitStatus = (typeof UNIT_STATUSES)[number];
export type CreateUnitInput = {
    floorId: string;
    unitNumber: string;
    type: string;
    status?: string;
    price: number | string;
    area?: number | null;
};
export type UpdateUnitInput = {
    floorId?: string;
    unitNumber?: string;
    type?: string;
    status?: string;
    price?: number | string;
    area?: number | null;
};
export type UpdateUnitStatusInput = {
    status: string;
};
