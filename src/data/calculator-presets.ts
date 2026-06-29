import type { CalculatorPreset } from "@/lib/types";

let _id = 1;
const cid = () => String(_id++);

export const calculatorPresets: CalculatorPreset[] = [
  {
    id: "smoothie",
    name: "Smoothie",
    defaultSellingPrice: 495, // £4.95
    components: [
      { id: cid(), label: "Smoothie sachet / mix", cost: 89, editable: false, removable: false },
      { id: cid(), label: "Juice (200ml)", cost: 34, editable: false, removable: true },
      { id: cid(), label: "Cup", cost: 5, editable: false, removable: false },
      { id: cid(), label: "Lid", cost: 3, editable: false, removable: false },
      { id: cid(), label: "Straw", cost: 2, editable: false, removable: false },
    ],
  },
  {
    id: "shake",
    name: "Milkshake",
    defaultSellingPrice: 495, // £4.95
    components: [
      { id: cid(), label: "Shake Pot", cost: 117, editable: false, removable: false },
      { id: cid(), label: "Milk", cost: 14, editable: false, removable: false },
      { id: cid(), label: "Cup", cost: 5, editable: false, removable: false },
      { id: cid(), label: "Lid", cost: 3, editable: false, removable: false },
      { id: cid(), label: "Straw", cost: 2, editable: false, removable: false },
    ],
  },
  {
    id: "custom",
    name: "Custom",
    defaultSellingPrice: 400, // £4.00
    components: [
      { id: cid(), label: "Item 1", cost: 0, editable: true, removable: true },
    ],
  },
];
