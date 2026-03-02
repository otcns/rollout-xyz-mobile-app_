import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const JOB_TITLE_DEPARTMENTS: { department: string; roles: string[] }[] = [
  {
    department: "A&R",
    roles: [
      "A&R Coordinator",
      "A&R Administrator",
      "A&R Manager",
      "A&R Director",
      "Senior Director of A&R",
      "VP of A&R",
      "SVP of A&R",
      "EVP of A&R",
      "Head of A&R",
    ],
  },
  {
    department: "Management",
    roles: [
      "Assistant Manager",
      "Day-to-Day Manager",
      "Artist Manager",
      "Senior Manager",
      "Tour Manager",
      "Business Manager",
      "Head of Management",
    ],
  },
  {
    department: "Marketing",
    roles: [
      "Marketing Coordinator",
      "Marketing Associate",
      "Marketing Manager",
      "Senior Marketing Manager",
      "Director of Marketing",
      "VP of Marketing",
      "Head of Digital Marketing",
      "Head of Marketing",
    ],
  },
  {
    department: "Creative & Content",
    roles: [
      "Graphic Designer",
      "Content Creator",
      "Videographer",
      "Content Manager",
      "Art Director",
      "Creative Director",
      "Head of Creative",
    ],
  },
  {
    department: "Legal & Business Affairs",
    roles: [
      "Paralegal",
      "Business Affairs Coordinator",
      "Business Affairs Manager",
      "Director of Business Affairs",
      "VP of Legal",
      "General Counsel",
    ],
  },
  {
    department: "Finance & Accounting",
    roles: [
      "Accounting Clerk",
      "Royalty Analyst",
      "Accountant",
      "Senior Accountant",
      "Controller",
      "VP of Finance",
      "CFO",
    ],
  },
  {
    department: "Operations & Admin",
    roles: [
      "Executive Assistant",
      "Office Manager",
      "Operations Manager",
      "Chief of Staff",
      "COO",
    ],
  },
  {
    department: "Promotion",
    roles: [
      "Regional Promoter",
      "Radio Promoter",
      "National Director of Promotion",
      "VP of Promotion",
      "Head of Promotion",
    ],
  },
];

interface JobTitleSelectProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  triggerClassName?: string;
}

export function JobTitleSelect({
  value,
  onChange,
  placeholder = "Select job title",
  className,
  triggerClassName,
}: JobTitleSelectProps) {
  return (
    <Select value={value || undefined} onValueChange={onChange}>
      <SelectTrigger className={triggerClassName}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className={`max-h-72 ${className || ""}`}>
        {JOB_TITLE_DEPARTMENTS.map((dept) => (
          <SelectGroup key={dept.department}>
            <SelectLabel className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {dept.department}
            </SelectLabel>
            {dept.roles.map((role) => (
              <SelectItem key={role} value={role}>
                {role}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  );
}

export { JOB_TITLE_DEPARTMENTS };
