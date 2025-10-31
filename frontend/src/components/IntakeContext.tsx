import React, { createContext, useContext, useState } from "react";

type IntakeData = {
  disclaimerAccepted?: boolean;
  isAdult?: boolean;
  hasBloodwork?: boolean;
  gender?: string;
  genderAtBirth?: string;
  pregnantOrNursing?: boolean;
  menstruationStatus?: string;
  bowelMovement?: string;
  manualValues?: Record<string, any>;
  selectedReports?: string[];
  cbc?: object;
  cmb?: object;
  hemoglobin?: object;
  iron?: object;
  lipid?: object;
  magnesium?: object;
  thyroid?: object;
  vitaminD?: object;
};

type IntakeContextType = {
  intakeData: IntakeData;
  setIntakeData: React.Dispatch<React.SetStateAction<IntakeData>>;
  resetIntake: () => void;
  getNextReportPage: (currentKey: string) => string | null; // 👈 NEW
};

const IntakeContext = createContext<IntakeContextType | null>(null);

export const IntakeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [intakeData, setIntakeData] = useState<IntakeData>({});

  const resetIntake = () => setIntakeData({});

  const getNextReportPage = (currentKey: string): string => {
    const reports = intakeData.selectedReports ?? [];
    const index = reports.indexOf(currentKey);
    if (index === -1) return "/upload/generate-report";
    if (index === reports.length - 1) return "/upload/generate-report";
    const nextKey = reports[index + 1];
    if (nextKey === "cbc") return "/upload/cbc1";
    if (nextKey === "cmp") return "/upload/cmb141";

    if (nextKey === "ironPanel") return "/upload/iron";
    if (nextKey === "hba1c") return "/upload/hemoglobin";

    if (nextKey === "lipidPanel") return "/upload/lipid";

    if (nextKey === "magnesium") return "/upload/magnesium";
    if (nextKey === "thyroid") return "/upload/thyroid1";
    if (nextKey === "vitaminD") return "/upload/vitaminD";

    return "/dashboard";
  };

  return (
    <IntakeContext.Provider
      value={{ intakeData, setIntakeData, resetIntake, getNextReportPage }}
    >
      {children}
    </IntakeContext.Provider>
  );
};

export const useIntake = () => {
  const ctx = useContext(IntakeContext);
  if (!ctx) throw new Error("useIntake must be used within an IntakeProvider");
  return ctx;
};
