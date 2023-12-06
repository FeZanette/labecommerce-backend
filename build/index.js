"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// import { users, products, getAllProducts, searchProductByName, createProduct } from "./database"
const database_1 = require("./database");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.listen(3003, () => {
    console.log("Servidor rodando na porta 3003");
});
app.get("/ping", (req, res) => {
    res.send("Pong!");
});
// Get All Users
app.get("/users", (req, res) => {
    res.send(database_1.users);
});
// Get All Products
// app.get("/products", (req: Request, res: Response) => {
//     res.send(products)
// })
// Get All Products com query
app.get("/products", (req, res) => {
    const nameToFind = req.query.name;
    console.log(nameToFind);
    if (nameToFind) {
        const result = database_1.products.filter((product) => {
            return product.name.toLowerCase().includes(nameToFind.toLowerCase());
        });
        res.status(200).send(result);
    }
    res.status(200).send(database_1.products);
});
// // console.log(users);
// // console.log(products);
// // --------------------------------------------------------
// // EXERCÍCIO 1:
// const createUserResult = createUser ("u003", "Astrodev", "astrodev@email.com", "astrodev99")
// console.log(createUserResult);
// const allUsers = getAllUsers()
// console.log(`Lista de usuários:`, allUsers);
// // --------------------------------------------------------
// // EXERCÍCIO 2:
// const createProductResult = createProduct("prod003", "SSD gamer", 349.99, "Acelere seu sistema com velocidades incríveis de leitura e gravação.", "https://images.unsplash.com/photo")
// console.log(createProductResult);
// const allProducts = getAllProducts()
// console.log(`Lista de produtos:`, allProducts);
// // --------------------------------------------------------
// // EXERCÍCIO 3:
// const searchResults = searchProductByName("Monitor")
// console.log(`O produto buscado é:`,searchResults);
