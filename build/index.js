"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// import { users, products, getAllProducts, searchProductByName, createProduct } from "./database"
const database_1 = require("./database");
// console.log(users);
// console.log(products);
// --------------------------------------------------------
// EXERCÍCIO 1:
const createUserResult = (0, database_1.createUser)("u003", "Astrodev", "astrodev@email.com", "astrodev99");
console.log(createUserResult);
const allUsers = (0, database_1.getAllUsers)();
console.log(`Lista de usuários:`, allUsers);
// --------------------------------------------------------
// EXERCÍCIO 2:
const createProductResult = (0, database_1.createProduct)("prod003", "SSD gamer", 349.99, "Acelere seu sistema com velocidades incríveis de leitura e gravação.", "https://images.unsplash.com/photo");
console.log(createProductResult);
const allProducts = (0, database_1.getAllProducts)();
console.log(`Lista de produtos:`, allProducts);
// --------------------------------------------------------
// EXERCÍCIO 3:
const searchResults = (0, database_1.searchProductByName)("Monitor");
console.log(`O produto buscado é:`, searchResults);
