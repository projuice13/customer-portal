import type { CalculatorPreset } from "@/lib/types";

let _id = 1;
const cid = () => String(_id++);

export const calculatorPresets: CalculatorPreset[] = [
  {
    id: "smoothie",
    name: "Smoothie",
    defaultSellingPrice: 450, // £4.50
    components: [
      { id: cid(), label: "Smoothie sachet / mix", cost: 85, editable: false, removable: false },
      { id: cid(), label: "Cup (12oz)", cost: 12, editable: false, removable: false },
      { id: cid(), label: "Lid", cost: 4, editable: false, removable: false },
      { id: cid(), label: "Straw", cost: 3, editable: false, removable: false },
      { id: cid(), label: "Juice (200-250ml)", cost: 20, editable: false, removable: true },
    ],
  },
  {
    id: "shake",
    name: "Milkshake",
    defaultSellingPrice: 395, // £3.95
    components: [
      { id: cid(), label: "Shake powder", cost: 70, editable: false, removable: false },
      { id: cid(), label: "Cup (16oz)", cost: 15, editable: false, removable: false },
      { id: cid(), label: "Lid", cost: 4, editable: false, removable: false },
      { id: cid(), label: "Straw", cost: 3, editable: false, removable: false },
      { id: cid(), label: "Milk (300ml)", cost: 30, editable: false, removable: false },
      { id: cid(), label: "Topping / extras", cost: 15, editable: false, removable: true },
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
