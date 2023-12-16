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

// -------------------------------------------
// Get All Users: não precisa de validação, basta refatorar para o uso do try/catch

app.get("/users", (req: Request, res: Response) => {
  try {
    res.status(200).send(users);
  } catch (error) {
    if (res.statusCode === 200) {
      // se no try der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) {
      //se der o erro 404
      res.send(error.message);
    } else {
      // senão for uma instância do erro 404, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

// -------------------------------------------
// Get All Products
// app.get("/products", (req: Request, res: Response) => {
//     res.send(products)
// })

// Get All Products com query: se query params for recebido, deve possuir pelo menos um caractere

app.get("/products", (req: Request, res: Response) => {
  try {
    const nameToFind = req.query.name as string;
    // console.log(nameToFind);

    if (nameToFind !== undefined) {
      if (nameToFind.length < 1) {
        // Verificar se o nome tem no mínimo 1 caractere
        res.status(400);
        throw new Error("'name' inválido. Deve ter no mínimo 1 caractere");
      }
    }

    if (nameToFind) {
      const result: TProduct[] = products.filter((result) => {
        return result.name.toLowerCase().includes(nameToFind.toLowerCase());
      });
      res.status(200).send(result);
    } else {
      res.status(200).send(products);
    }
  } catch (error) {
    if (res.statusCode === 200) {
      // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) {
      //se der o erro 404
      res.send(error.message); // manda a mensagem da linha 38
    } else {
      // senão for uma instância do erro 404, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

// -------------------------------------------

// Create User: validar o body
//  extra:
//  - não deve ser possível criar mais de uma conta com a mesma id
//  - não deve ser possível criar mais de uma conta com o mesmo e-mail

app.post("/users", (req: Request, res: Response) => {
  try {
    const id = req.body.id as string;
    const name = req.body.name as string;
    const email = req.body.email as string;
    const password = req.body.password as string;

    const newUser: TUser = {
      id,
      name,
      email,
      password,
      createdAt: new Date().toISOString(),
    };

    if (
      id === undefined ||
      name === undefined ||
      email === undefined ||
      password === undefined
    ) {
      // verifica se todos os elementos do body estão sendo passados
      res.status(400);
      throw new Error(
        "O body precisa ter todos os atributos: 'id', 'name', 'email' e 'password'"
      );
    }

    if (id !== undefined) {
      if (typeof id !== "string") {
        res.status(400);
        throw new Error("'id' inválido. Deve ser uma string");
      }
      const resultUser = users.find((user) => user.id === id);
      if (resultUser) {
        res.status(400); // res.statusCode = 400 -> outra forma de fazer essa sintaxe
        throw new Error("Esse id já existe"); //joga o resultado lá para o catch
      }
    }

    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400);
        throw new Error("'name' inválido. Deve ser uma string");
      }
      if (name.length < 2) {
        res.status(400);
        throw new Error("'name' inválido. Deve ter no mínimo 2 caracteres");
      }
    }

    if (email !== undefined) {
      if (typeof email !== "string") {
        res.status(400);
        throw new Error("'email' inválido. Deve ser uma string");
      }
      const resultEmail = users.find((user) => user.email === email);
      if (resultEmail) {
        res.status(400); // res.statusCode = 400 -> outra forma de fazer essa sintaxe
        throw new Error("Esse e-mail já existe"); //joga o resultado lá para o catch
      }
    }

    if (password !== undefined) {
      if (typeof password !== "string") {
        res.statusCode = 400;
        throw new Error("'password' inválido. Deve ser uma string");
      }
      if (
        !password.match(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
        )
      ) {
        res.statusCode = 400;
        throw new Error(
          "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas, no mínimo um número e um caractere especial"
        );
      }
    }

    users.push(newUser);
    res.status(201).send("Cadastro realizado com sucesso");
  } catch (error) {
    if (res.statusCode === 200) {
      // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) {
      //se der o erro 400
      res.send(error.message); // manda a mensagem
    } else {
      // senão for uma instância do erro 400, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

// -------------------------------------------
// Create Product: validar o body
// extra: não deve ser possível criar mais de um produto com a mesma id

app.post("/products", (req: Request, res: Response) => {
  try {
    // body sem desestruturar:
    // const id = req.body.id as string;
    // const name = req.body.name as string;
    // const price = req.body.pricce as number;
    // const description = req.body.description as string;
    // const imageUrl = req.body.imageUrl as string;

    // body usando desestruturação;
    const { id, name, price, description, imageUrl } = req.body;

    const newProduct = {
      id,
      name,
      price,
      description,
      imageUrl,
    };

    if (
      id === undefined ||
      name === undefined ||
      price === undefined ||
      description === undefined ||
      imageUrl === undefined
    ) {
      // verifica se todos os elementos do body estão sendo passados
      res.status(400);
      throw new Error(
        "O body precisa ter todos os atributos: 'id', 'name', 'price', 'description' e 'imageUrl'"
      );
    }

    if (id !== undefined) {
      if (typeof id !== "string") {
        res.status(400);
        throw new Error("'id' inválido. Deve ser uma string");
      }
      const resultProduct = products.find((result) => result.id === id);
      if (resultProduct) {
        res.status(400); // res.statusCode = 400 -> outra forma de fazer essa sintaxe
        throw new Error("Esse id já existe"); //joga o resultado lá para o catch
      }
    }

    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400);
        throw new Error("'name' inválido. Deve ser uma string");
      }
      if (name.length < 2) {
        res.status(400);
        throw new Error("'name' inválido. Deve ter no mínimo 2 caracteres");
      }
    }

    if (price !== undefined) {
      if (typeof price !== "number") {
        res.status(400);
        throw new Error("'price' inválido. Deve ser um number");
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        res.status(400);
        throw new Error("'description' inválido. Deve ser uma string");
      }
      if (description.length < 2) {
        res.status(400);
        throw new Error(
          "'description' inválido. Deve ter no mínimo 2 caracteres"
        );
      }
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string") {
        res.status(400);
        throw new Error("'imageUrl' inválido. Deve ser uma string");
      }
      if (imageUrl.length < 2) {
        res.status(400);
        throw new Error("'imageUrl' inválido. Deve ter no mínimo 2 caracteres");
      }
    }

    products.push(newProduct);
    res.status(201).send("Produto cadastrado com sucesso");
  } catch (error) {
    if (res.statusCode === 200) {
      // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) {
      //se der o erro 400
      res.send(error.message); // manda a mensagem
    } else {
      // senão for uma instância do erro 400, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

// -------------------------------------------
// delete User By Id: validar que a conta existe antes de deletá-la

app.delete("/users/:id", (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    const userIndex: number = users.findIndex((user) => {
      return user.id === idToDelete;
    });

    if (userIndex < 0) {
      res.status(404);
      throw new Error("Usuário não encontrado");
    }

    if (userIndex >= 0) {
      users.splice(userIndex, 1);
    }

    res.status(200).send("Usuário apagado com sucesso");
  } catch (error) {
    if (res.statusCode === 200) {
      // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) {
      //se der o erro 400
      res.send(error.message); // manda a mensagem
    } else {
      // senão for uma instância do erro 400, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

// -------------------------------------------
// delete Product By Id: validar que o produto existe antes de deletá-lo

app.delete("/products/:id", (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    const productIndex: number = products.findIndex(
      (result) => result.id === idToDelete
    );

    if (productIndex < 0) {
      res.status(404);
      throw new Error("Produto não encontrado");
    }

    if (productIndex >= 0) {
      products.splice(productIndex, 1);
    }

    res.status(200).send("Produto apagado com sucesso");
  } catch (error) {
    if (res.statusCode === 200) {
      // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
      res.status(500); //erro inesperado
    }

    if (error instanceof Error) {
      //se der o erro 400
      res.send(error.message); // manda a mensagem
    } else {
      // senão for uma instância do erro 400, manda
      res.send("Erro inesperado"); // a mensagem do erro 500
    }
  }
});

// -------------------------------------------
// edit Product By Id:
// - validar que o produto existe antes de editá-lo
// - validar os dados opcionais do body se eles forem recebidos

app.put("/products/:id", (req: Request, res: Response) => {
  try {
    const idToEdit = req.params.id;
          
    // body usando desestruturação;
    const { id, name, price, description, imageUrl } = req.body;
       
    const result = products.find((result) => result.id === idToEdit);

    if (result === undefined) {
      res.status(404)
      throw new Error("Produto não encontrado")
    }
    
    if (id !== undefined) {
      if (typeof id !== "string") {
        res.status(400)
        throw new Error("'id' inválido. Deve ser uma string")
      }
    }
    
    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400)
        throw new Error("'name' inválido. Deve ser uma string")
      }
    }

    if (price !== undefined) {
      if (typeof price !== "number") {
        res.status(400)
        throw new Error("'price' inválido. Deve ser uma number")
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        res.status(400)
        throw new Error("'description' inválido. Deve ser uma string")
      }
    }
    
    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string") {
        res.status(400)
        throw new Error("'imageUrl' inválido. Deve ser uma string")
      }
    }

    if (result) {
      result.id = id || result.id;
      result.name = name || result.name;
      result.price = price || result.price;
      result.description = description || result.description;
      result.imageUrl = imageUrl || result.imageUrl
    }
        
    res.status(200).send("Produto atualizado com sucesso");

    } catch (error) {
      if (res.statusCode === 200) {
        // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
        res.status(500); //erro inesperado
      }
  
      if (error instanceof Error) {  //se der o erro 400
        res.send(error.message); // manda a mensagem
      } else {  // senão for uma instância do erro 400, manda
        res.send("Erro inesperado"); // a mensagem do erro 500
      }
    }

    });