export declare const CURRENCIES: readonly [{
    readonly code: "ETB";
    readonly label: "Ethiopian Birr (ETB)";
}, {
    readonly code: "USD";
    readonly label: "US Dollar (USD)";
}, {
    readonly code: "EUR";
    readonly label: "Euro (EUR)";
}, {
    readonly code: "GBP";
    readonly label: "British Pound (GBP)";
}, {
    readonly code: "KES";
    readonly label: "Kenyan Shilling (KES)";
}, {
    readonly code: "AED";
    readonly label: "UAE Dirham (AED)";
}];
export type CurrencyCode = (typeof CURRENCIES)[number]["code"];
export declare const CONSTRUCTION_MILESTONES: readonly [{
    readonly stage: "EXCAVATION";
    readonly percentage: 30;
    readonly label: "Excavation & Substructure (የመሠረት ሥራ)";
}, {
    readonly stage: "FOUNDATION";
    readonly percentage: 20;
    readonly label: "Foundation & Superstructure (መሠረት ማጠናቀቅ)";
}, {
    readonly stage: "STRUCTURE";
    readonly percentage: 20;
    readonly label: "Structural Framing & Concrete (ኮንክሪት ሥራ)";
}, {
    readonly stage: "FINISHING";
    readonly percentage: 20;
    readonly label: "Interior & Exterior Finishing (የውስጥ እና የውጭ ማጠናቀቂያ)";
}, {
    readonly stage: "HANDOVER";
    readonly percentage: 10;
    readonly label: "Final Inspection & Key Handover (ቁልፍ ማስረከብ)";
}];
export type ConstructionStage = (typeof CONSTRUCTION_MILESTONES)[number]["stage"];
