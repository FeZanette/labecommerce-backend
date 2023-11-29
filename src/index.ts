// import { users, products, getAllProducts, searchProductByName, createProduct } from "./database"
import { createProduct, createUser, getAllProducts, getAllUsers, searchProductByName } from "./database"

// console.log(users);
// console.log(products);

// --------------------------------------------------------
// EXERCÍCIO 1:

const createUserResult = createUser ("u003", "Astrodev", "astrodev@email.com", "astrodev99")
console.log(createUserResult);

const allUsers = getAllUsers()
console.log(`Lista de usuários:`, allUsers);


// --------------------------------------------------------
// EXERCÍCIO 2:

const createProductResult = createProduct("prod003", "SSD gamer", 349.99, "Acelere seu sistema com velocidades incríveis de leitura e gravação.", "https://images.unsplash.com/photo")
console.log(createProductResult);

const allProducts = getAllProducts()
console.log(`Lista de produtos:`, allProducts);

// --------------------------------------------------------
// EXERCÍCIO 3:

const searchResults = searchProductByName("Monitor")
console.log(`O produto buscado é:`,searchResults);
