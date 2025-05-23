export interface MenuItem {
  id: number;
  name: string;
  type: string;
  price: number;
  image: string;
  description: string;
  customizationOptions?: {
    sugarLevels?: string[];
    sizes?: { [key: string]: number };
    addOns?: { [key: string]: number };
    temperature?: string[];
    milk?: string[];
  };
}

export const dataItems: MenuItem[] = [
  // Your existing data items
];
