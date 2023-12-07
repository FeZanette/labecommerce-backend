// import { users, products, getAllProducts, searchProductByName, createProduct } from "./database"
import {
  createProduct,
  createUser,
  getAllProducts,
  getAllUsers,
  products,
  searchProductByName,
  users,
} from "./database";
import express, { Request, Response } from "express";
import cors from "cors";
import { TProduct, TUser } from "./types";
import { Tracing } from "trace_events";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
  console.log("Servidor rodando na porta 3003");
});

app.get("/ping", (req: Request, res: Response) => {
  res.send("Pong!");
});

// Get All Users
app.get("/users", (req: Request, res: Response) => {
  res.send(users);
});

// Get All Products
// app.get("/products", (req: Request, res: Response) => {
//     res.send(products)
// })

// Get All Products com query
app.get("/products", (req: Request, res: Response) => {
  const nameToFind = req.query.name as string;
  console.log(nameToFind);

  if (nameToFind) {
    const result: TProduct[] = products.filter((product) => {
      return product.name.toLowerCase().includes(nameToFind.toLowerCase());
    });
    res.status(200).send(result);
  } else {
    res.status(200).send(products);
  }
});

// Create User
app.post("/users", (req: Request, res: Response) => {
  const id = req.body.id as string;
  const name = req.body.name as string;
  const email = req.body.email as string;
  const password = req.body.password as string;

  const newUser = {
    id,
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser)
  res.status(201).send("Cadastro realizado com sucesso");
});

// Create Product
app.post("/products", (req: Request, res: Response) => {
  const id = req.body.id as string;
  const name = req.body.name as string;
  const price = req.body.pricce as number;
  const description = req.body.description as string;
  const imageUrl = req.body.imageUrl as string

  const newProduct = {
    id,
    name,
    price,
    description,
    imageUrl
  };

  products.push(newProduct)
  res.status(201).send("Produto cadastrado com sucesso");
});


// delete User By Id
app.delete("/users/:id", (req: Request, res: Response) => {
  const idToDelete = req.params.id;

  const userIndex: number = users.findIndex((user) => {
    return user.id === idToDelete
  });

  if (userIndex >= 0) {
    users.splice(userIndex, 1);
  }
  res.status(200).send("User apagado com sucesso");
});

// delete Product By Id
app.delete("/products/:id", (req: Request, res: Response) => {
  const idToDelete = req.params.id;

  const productIndex: number = products.findIndex((product) => product.id === idToDelete);

  if (productIndex >= 0) {
    products.splice(productIndex, 1);
  }
  res.status(200).send("Produto apagado com sucesso");
});

// edit Product By Id
app.put ("/products/:id" , (req: Request, res: Response) => {
  const idToEdit = req. params.id

  const newId = req.body.id as string | undefined
  const newName = req.body.name as string | undefined
  const newPrice = req.body.price as number | undefined
  const newDescription = req.body.description as string | undefined
  const newImageUrl = req.body.imageUrl as string | undefined

  const result: TProduct | undefined = products.find((product) => product.id === idToEdit)

  if (result) {
      result.id = newId || result.id
      result.name = newName || result.name
      result.price = newPrice || result.price
      // result.price = isNaN(Number(newPrice)) ? result.price : newPrice as number
      result.description = newDescription || result.description
      result.imageUrl = newImageUrl || result.imageUrl
  }

  res.status(200).send("Produto atualizado com sucesso")
})


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
