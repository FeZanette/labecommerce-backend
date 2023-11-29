import { TProduct, TUser } from "./types";

export const users: TUser[] = [
  {
    id: "u001",
    name: "Fulano",
    email: "fulano@gmail.com",
    password: "fulano123",
    createdAt: new Date().toISOString(),
  },
  {
    id: "u002",
    name: "Beltrana",
    email: "beltrana@gmail.com",
    password: "beltrana00",
    createdAt: new Date().toISOString(),
  },
];

export const products: TProduct[] = [
  {
    id: "prod001",
    name: "Mouse gamer",
    price: 250,
    description: "Melhor mouse do mercado!",
    imageUrl: "https://picsum.photos/seed/Mouse%20gamer/400",
  },
  {
    id: "prod002",
    name: "Monitor",
    price: 900,
    description: "Monitor LED Full HD 24 polegadas",
    imageUrl: "https://picsum.photos/seed/Monitor/400",
  },
];

// -----------------------------------------------------------
// EXERCÍCIO 1:

export function createUser(
  id: string,
  name: string,
  email: string,
  password: string
): string {
  const createdAt = new Date().toISOString();
  const newUser: TUser = { id, name, email, password, createdAt };
  users.push(newUser);
  return "Cadastro realizado com sucesso";
}

export function getAllUsers(): TUser[] {
  return users;
}

// --------------------------------------------------------
// EXERCÍCIO 2:

export function createProduct(
  id: string,
  name: string,
  price: number,
  description: string,
  imageUrl: string
): string {
  const newProduct: TProduct = { id, name, price, description, imageUrl };
  products.push(newProduct);
  return "Produto criado com sucesso";
}

export function getAllProducts(): TProduct[] {
  return products;
}

// --------------------------------------------------------
// EXERCÍCIO 3:

export function searchProductByName (name: string): TProduct[] {
  return products.filter((product) => {
    return product.name.toLowerCase().includes(name.toLowerCase())
  })}