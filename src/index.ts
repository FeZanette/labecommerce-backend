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
import { db } from "./database/knex";
import { log } from "console";

const app = express();

app.use(express.json());
app.use(cors());

app.listen(3003, () => {
  console.log("Servidor rodando na porta 3003");
});

app.get("/ping", async (req: Request, res: Response) => {
  try {
    res.status(200).send({ message: "Pong!" });
  } catch (error) {
    console.log(error);

    if (req.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

// ____________________________________________________________________________________________
// USERS ENDPOINTS

// -- Get All Users --

app.get("/users", async (req: Request, res: Response) => {
  try {
    const user: TUser[] = await db("users");
    res.status(200).send(user);
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

// -- Create User --

app.post("/users", async (req: Request, res: Response) => {
  try {
    // const id = req.body.id as string;
    // const name = req.body.name as string;
    // const email = req.body.email as string;
    // const password = req.body.password as string;

    // FORMA DESESTRUTURADA:
    const { id, name, email, password } = req.body;

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
      if (id.length < 4) {
        res.status(400);
        throw new Error("'id' inválido. Deve ter no mínimo 4 caracteres");
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
        res.status(400);
        throw new Error("Esse e-mail já existe");
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

    // const resultUser = users.find((user) => user.id === id);

    const [userIdAlreadyExists]: TUser[] | undefined[] = await db("users").where({ id: id });

    if (userIdAlreadyExists) {
      res.status(400);
      throw new Error("Esse id já existe");
    }

    const [userEmailAlreadyExists]: TUser[] | undefined[] = await db("users").where({ email: email });

    if (userEmailAlreadyExists) {
      res.status(400);
      throw new Error("Esse email já existe");
    }

    const createAt = new Date().toISOString();

    const newUser: TUser = {
      id: id,
      name: name,
      email: email,
      password: password,
      created_at: createAt
    };
    // await db.raw(`
    //   INSERT INTO users (id, name, email, password, created_at)
    //   VALUES ("${id}", "${name}", "${email}", "${password}", "${createAt}");
    // `);

    await db("users").insert(newUser);
    res.status(201).send({
      message: "Cadastro realizado com sucesso",
      user: newUser
    });

  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }

    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

// -- Delete User By Id --

app.delete("/users/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete: string = req.params.id;

    // const userIndex: number = users.findIndex((user) => {
    //   return user.id === idToDelete;
    // });

    // const [userIndex] = await db.raw(`SELECT * FROM users`);

    const [userIndex] = await db("users").where({ id: idToDelete });

    if (userIndex < 0) {
      res.status(404);
      throw new Error("Usuário não encontrado");
    }

    // if (userIndex >= 0) {
    //   users.splice(userIndex, 1);
    // }

    // await db.raw(`
    //     DELETE FROM users
    //     WHERE id = "${idToDelete}"
    //   `);

    await db("users").del().where({ id: idToDelete });

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

// --  Edit User (não pedia para fazer esse endpoint) --

app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit: string = req.params.id;

    const newId = req.body.id as string;
    const newName = req.body.name as string;
    const newEmail = req.body.email as string;
    const newPassword = req.body.password as string;

    if (newId !== undefined) {
      if (typeof newId !== "string") {
        res.status(400);
        throw new Error("'id' inválido. Deve ser uma string");
      }
      const resultUser = users.find((user) => user.id === newId);
      if (resultUser) {
        res.status(400);
        throw new Error("Esse id já existe");
      }
    }

    if (newName !== undefined) {
      if (typeof newName !== "string") {
        res.status(400);
        throw new Error("'name' inválido. Deve ser uma string");
      }
      if (newName.length < 2) {
        res.status(400);
        throw new Error("'name' inválido. Deve ter no mínimo 2 caracteres");
      }
    }

    if (newEmail !== undefined) {
      if (typeof newEmail !== "string") {
        res.status(400);
        throw new Error("'email' inválido. Deve ser uma string");
      }
      const resultEmail = users.find((user) => user.email === newEmail);
      if (resultEmail) {
        res.status(400);
        throw new Error("Esse e-mail já existe");
      }
    }

    if (newPassword !== undefined) {
      if (typeof newPassword !== "string") {
        res.statusCode = 400;
        throw new Error("'password' inválido. Deve ser uma string");
      }
      if (
        !newPassword.match(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
        )
      ) {
        res.statusCode = 400;
        throw new Error(
          "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas, no mínimo um número e um caractere especial"
        );
      }
    }

    // const [putUser] = await db.raw(`
    //   SELECT * FROM users
    //   WHERE id = "${idToEdit}"
    // `);

    const [user] = await db("users").where({ id: idToEdit });

    if (user) {
      const updatedUser = {
        id: newId || user.id,
        name: newName || user.name,
        email: newEmail || user.email,
        password: newPassword || user.password,
      };
      await db("users").update(updatedUser).where({ id: idToEdit });
    } else {
      res.status(404);
      throw new Error("Usuário não encontrado");
    }

    // if (user < 0) {
    //   res.status(404);
    //   throw new Error("Usuário não encontrado");
    // }

    // const newQuery: string = query.join(", ");
    // console.log(newQuery);

    // await db.raw(`
    //   UPDATE users
    //   SET ${newQuery}
    //   WHERE id = "${idToEdit}"
    // `);
    res.status(201).send("Informações atualizadas com scesso!");
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

// app.delete("/users/:id", async (req: Request, res: Response) => {
//   try {
//     const idToDelete: string = req.params.id;

//     // const userIndex: number = users.findIndex((user) => {
//     //   return user.id === idToDelete;
//     // });

//     // const [userIndex] = await db.raw(`SELECT * FROM users`);

//     const [userIndex] = await db("users").where({ id: idToDelete });

//     if (userIndex < 0) {
//       res.status(404);
//       throw new Error("Usuário não encontrado");
//     }

//     // if (userIndex >= 0) {
//     //   users.splice(userIndex, 1);
//     // }

//     // await db.raw(`
//     //     DELETE FROM users
//     //     WHERE id = "${idToDelete}"
//     //   `);

//     await db("users").del().where({ id: idToDelete });

//     res.status(200).send("Usuário apagado com sucesso");
//   } catch (error) {
//     if (res.statusCode === 200) {
//       // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
//       res.status(500); //erro inesperado
//     }

//     if (error instanceof Error) {
//       //se der o erro 400
//       res.send(error.message); // manda a mensagem
//     } else {
//       // senão for uma instância do erro 400, manda
//       res.send("Erro inesperado"); // a mensagem do erro 500
//     }
//   }
// });

// --  Edit User (não pedia para fazer esse endpoint) => VERSÃO DA AULA ANTERIOR ANTES DE REFATORAR PARA QUERY BUILDER--

// app.put("/users/:id", async (req: Request, res: Response) => {
//   try {
//     const idToEdit: string = req.params.id;

//     const id = req.body.id as string;
//     const name = req.body.name as string;
//     const email = req.body.email as string;
//     const password = req.body.password as string;

//     // const [putUser] = await db.raw(`
//     //   SELECT * FROM users
//     //   WHERE id = "${idToEdit}"
//     // `);

//     const [ user ] = await db("users").where({id: idToEdit})

//     if (user < 0) {
//       res.status(404);
//       throw new Error("Usuário não encontrado");
//     }

//     const query: Array<string> = [];

//     if (id !== undefined) {
//       if (typeof id !== "string") {
//         res.status(400);
//         throw new Error("'id' inválido. Deve ser uma string");
//       }
//       const resultUser = users.find((user) => user.id === id);
//       if (resultUser) {
//         res.status(400);
//         throw new Error("Esse id já existe");
//       }
//       query.push(`id = "${id}"`);
//     }

//     if (name !== undefined) {
//       if (typeof name !== "string") {
//         res.status(400);
//         throw new Error("'name' inválido. Deve ser uma string");
//       }
//       if (name.length < 2) {
//         res.status(400);
//         throw new Error("'name' inválido. Deve ter no mínimo 2 caracteres");
//       }
//       query.push(`name = "${name}"`);
//     }

//     if (email !== undefined) {
//       if (typeof email !== "string") {
//         res.status(400);
//         throw new Error("'email' inválido. Deve ser uma string");
//       }
//       const resultEmail = users.find((user) => user.email === email);
//       if (resultEmail) {
//         res.status(400);
//         throw new Error("Esse e-mail já existe");
//       }
//       query.push(`email =  "${email}"`);
//     }

//     if (password !== undefined) {
//       if (typeof password !== "string") {
//         res.statusCode = 400;
//         throw new Error("'password' inválido. Deve ser uma string");
//       }
//       if (
//         !password.match(
//           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
//         )
//       ) {
//         res.statusCode = 400;
//         throw new Error(
//           "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas, no mínimo um número e um caractere especial"
//         );
//       }
//       query.push(`password = "${password}"`);
//     }

//     const newQuery: string = query.join(", ");
//     console.log(newQuery);

//     await db.raw(`
//       UPDATE users
//       SET ${newQuery}
//       WHERE id = "${idToEdit}"
//     `);
//     res.status(201).send("Informações atualizadas com scesso!");
//   } catch (error) {
//     if (res.statusCode === 200) {
//       // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
//       res.status(500); //erro inesperado
//     }

//     if (error instanceof Error) {
//       //se der o erro 400
//       res.send(error.message); // manda a mensagem
//     } else {
//       // senão for uma instância do erro 400, manda
//       res.send("Erro inesperado"); // a mensagem do erro 500
//     }
//   }
// });

// ____________________________________________________________________________________________
// PRODUCTS ENDPOINTS

// Get All Products
// app.get("/products", (req: Request, res: Response) => {
//     res.send(products)
// })

// -- Get All Products --

app.get("/products", async (req: Request, res: Response) => {
  try {
    const nameToFind = req.query.name as string;

    if (nameToFind !== undefined) {
      if (nameToFind.length < 1) {
        res.status(400);
        throw new Error("'name' inválido. Deve ter no mínimo 1 caractere");
      }

      // const result: Array<TProduct> | undefined = await db.raw(`
      //   SELECT * FROM products
      //   WHERE name
      //   LIKE "%${nameToFind}%"
      // `);

      const result: Array<TProduct> | undefined = await db("products")
        .select()
        .where("name", "LIKE", `%${nameToFind}%`);

      // !!!!! NO POSTMAN NÃO ESTÁ ENCONTRANDO ATRAVÉS DE UMA PALAVRA ESPECÍFICA

      return res.status(200).send(result);
    }

    // const products: Array<TProduct> = await db.raw(`SELECT * FROM products`);

    const products: Array<TProduct> = await db("products");
    res.status(200).send(products);
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

// -- Create Product --

app.post("/products", async (req: Request, res: Response) => {
  try {
    // body sem desestruturar:
    // const id = req.body.id as string;
    // const name = req.body.name as string;
    // const price = req.body.pricce as number;
    // const description = req.body.description as string;
    // const imageUrl = req.body.imageUrl as string;

    // body usando desestruturação;
    const { id, name, price, description, imageUrl } = req.body;

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

      // const resultProduct = await db.raw(`
      //   SELECT * FROM products
      //   WHERE id = "${id}"
      // `);

      // const resultProduct = products.find((result) => result.id === id);

      const [resultProduct] = await db("products").where({ id: id });

      if (resultProduct) {
        res.status(400);
        throw new Error("Esse id já existe");
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
          throw new Error(
            "'imageUrl' inválido. Deve ter no mínimo 2 caracteres"
          );
        }
      }

      // products.push(newProduct);

      // await db.raw(`
      //   INSERT INTO products (id, name, price, description, image_url)
      //   VALUES ("${id}", "${name}", "${price}", "${description}", "${imageUrl}")
      // `);

      const newProduct = {
        id,
        name,
        price,
        description,
        image_url: imageUrl,
      };

      await db("products").insert(newProduct);

      res.status(201).send("Produto cadastrado com sucesso");
    }
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

// -- Delete Product By Id --

app.delete("/products/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    // const [productIndex] = await db.raw(`
    //   SELECT * FROM products
    // `);

    const [productIndex] = await db("products").where({ id: idToDelete });

    // const productIndex: number = products.findIndex(
    //   (result) => result.id === idToDelete
    // );

    if (productIndex < 0) {
      res.status(404);
      throw new Error("Produto não encontrado");
    }

    // if (productIndex >= 0) {
    //   products.splice(productIndex, 1);
    // }

    // await db.raw(`
    //   DELETE FROM products
    //   WHERE id = "${idToDelete}"
    // `);

    await db("products").del().where({ id: idToDelete });

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
// Edit Product By Id:

app.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit: string = req.params.id;

    // body usando desestruturação;
    // const { id, name, price, description, imageUrl } = req.body;

    const id = req.body.id;
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const imageUrl = req.body.imageUrl;

    // const result = products.find((result) => result.id === idToEdit);

    // const result = await db.raw(`
    //   SELECT * FROM products
    //   WHERE id = "${idToEdit}"
    // `);

    if (id !== undefined) {
      if (typeof id !== "string") {
        res.status(400);
        throw new Error("'id' inválido. Deve ser uma string");
      }
    }

    if (name !== undefined) {
      if (typeof name !== "string") {
        res.status(400);
        throw new Error("'name' inválido. Deve ser uma string");
      }
    }

    if (price !== undefined) {
      if (typeof price !== "number") {
        res.status(400);
        throw new Error("'price' inválido. Deve ser uma number");
      }
    }

    if (description !== undefined) {
      if (typeof description !== "string") {
        res.status(400);
        throw new Error("'description' inválido. Deve ser uma string");
      }
    }

    if (imageUrl !== undefined) {
      if (typeof imageUrl !== "string") {
        res.status(400);
        throw new Error("'imageUrl' inválido. Deve ser uma string");
      }
    }

    // if (result) {
    //   result.id = id || result.id;
    //   result.name = name || result.name;
    //   result.price = price || result.price;
    //   result.description = description || result.description;
    //   result.imageUrl = imageUrl || result.imageUrl;
    // }

    const [result] = await db("products").where({ id: idToEdit });

    if (result === undefined) {
      res.status(404);
      throw new Error("Produto não encontrado");
    }
    if (result) {
      const updatedProduct = {
        id: id || result.id,
        name: name || result.name,
        price: price || result.price,
        description: description || result.description,
        image_url: imageUrl || result.imageUrl,
      };
      await db("products").update(updatedProduct).where({ id: idToEdit });
    } else {
      res.status(400);
      throw new Error("'id' não encontardo");
    }
    res.status(200).send("Produto atualizado com sucesso");
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

// ____________________________________________________________________________________________
// PURCHASES ENDPOINTS

// -- Get All Purchase --

app.get("/purchases", async (req: Request, res: Response) => {
  try {
    const purchase: Array<TUser> = await db("purchases");
    res.status(200).send(purchase);
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

// -- Get Purchase By Id --

app.get("/purchases/:id", async (req: Request, res: Response) => {
  try {
    const idToSearch = req.params.id;
    const [purchase] = await db
      .select(
        "purchases.id AS purchaseId",
        "users.id AS buyerId",
        "users.name AS buyerName",
        "users.email AS buyerEmail",
        "purchases.total_price AS totalPrice",
        "purchases.created_at AS createdAt"
      )
      .from("purchases")
      .join("users", "purchases.buyer", "=", "users.id")
      .where({ "purchases.id": idToSearch });

    const purchasesProducts = await db
      .select("*")
      .from("purchases_products")
      .join("products", "purchase_id", "=", "products.id")
      .where("purchases_products.purchase_id", idToSearch);

    const list = {
      purchaseId: purchase.purchaseId,
      buyerId: purchase.buyerId,
      buyerName: purchase.buyerName,
      buyerEmail: purchase.buyerEmail,
      totalPrice: purchase.totalPrice,
      createdAt: purchase.createdAt,
      products: products,
    };
    res.status(200).send(list);
  } catch (error) {
    if (res.statusCode === 200) {
      res.status(500);
    }
    if (error instanceof Error) {
      res.send(error.message);
    } else {
      res.send("Erro inesperado");
    }
  }
});

// -- Create Purchase --

// app.post("/purchases", async (req: Request, res: Response) => {
//   try {
//     const id = req.body.id as string;
//     const buyer = req.body.buyer as string;
//     const total_price = req.body.totalPrice as number;

//     if (id === undefined || buyer === undefined || total_price === undefined) {
//       // verifica se todos os elementos do body estão sendo passados
//       res.status(400);
//       throw new Error(
//         "O body precisa ter todos os atributos: 'id', 'name', 'email' e 'password'"
//       );
//     }

//     if (id !== undefined) {
//       if (typeof id !== "string") {
//         res.status(400);
//         throw new Error("'id' inválido. Deve ser uma string");
//       }

//       const resultUser = users.find((user) => user.id === id);
//       if (resultUser) {
//         res.status(400);
//         throw new Error("Esse id já existe");
//       }
//     }

//     if (buyer !== undefined) {
//       if (typeof buyer !== "string") {
//         res.status(400);
//         throw new Error("'buyer' inválido. Deve ser uma string");
//       }
//       if (buyer.length < 2) {
//         res.status(400);
//         throw new Error("'buyer' inválido. Deve ter no mínimo 2 caracteres");
//       }
//     }

//     if (email !== undefined) {
//       if (typeof email !== "string") {
//         res.status(400);
//         throw new Error("'email' inválido. Deve ser uma string");
//       }
//       const resultEmail = users.find((user) => user.email === email);
//       if (resultEmail) {
//         res.status(400);
//         throw new Error("Esse e-mail já existe");
//       }
//     }

//     if (password !== undefined) {
//       if (typeof password !== "string") {
//         res.statusCode = 400;
//         throw new Error("'password' inválido. Deve ser uma string");
//       }
//       if (
//         !password.match(
//           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
//         )
//       ) {
//         res.statusCode = 400;
//         throw new Error(
//           "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas, no mínimo um número e um caractere especial"
//         );
//       }
//     }
//     const createAt = new Date().toISOString();

//     const newUser = {
//       id: id,
//       name: name,
//       email: email,
//       password: password,
//       created_at: createAt,
//     };
//     // await db.raw(`
//     //   INSERT INTO users (id, name, email, password, created_at)
//     //   VALUES ("${id}", "${name}", "${email}", "${password}", "${createAt}");
//     // `);

//     await db("users").insert(newUser);

//     res.status(201).send("Cadastro realizado com sucesso");
//   } catch (error) {
//     if (res.statusCode === 200) {
//       res.status(500);
//     }

//     if (error instanceof Error) {
//       res.send(error.message);
//     } else {
//       res.send("Erro inesperado");
//     }
//   }
// });

// -- Delete User By Id --

// app.delete("/users/:id", async (req: Request, res: Response) => {
//   try {
//     const idToDelete: string = req.params.id;

//     // const userIndex: number = users.findIndex((user) => {
//     //   return user.id === idToDelete;
//     // });

//     // const [userIndex] = await db.raw(`SELECT * FROM users`);

//     const [userIndex] = await db("users").where({ id: idToDelete });

//     if (userIndex < 0) {
//       res.status(404);
//       throw new Error("Usuário não encontrado");
//     }

//     // if (userIndex >= 0) {
//     //   users.splice(userIndex, 1);
//     // }

//     // await db.raw(`
//     //     DELETE FROM users
//     //     WHERE id = "${idToDelete}"
//     //   `);

//     await db("users").del().where({ id: idToDelete });

//     res.status(200).send("Usuário apagado com sucesso");
//   } catch (error) {
//     if (res.statusCode === 200) {
//       // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
//       res.status(500); //erro inesperado
//     }

//     if (error instanceof Error) {
//       //se der o erro 400
//       res.send(error.message); // manda a mensagem
//     } else {
//       // senão for uma instância do erro 400, manda
//       res.send("Erro inesperado"); // a mensagem do erro 500
//     }
//   }
// });

// --  Edit User (não pedia para fazer esse endpoint) --

// app.put("/users/:id", async (req: Request, res: Response) => {
//   try {
//     const idToEdit: string = req.params.id;

//     const newId = req.body.id as string;
//     const newName = req.body.name as string;
//     const newEmail = req.body.email as string;
//     const newPassword = req.body.password as string;

//     if (newId !== undefined) {
//       if (typeof newId !== "string") {
//         res.status(400);
//         throw new Error("'id' inválido. Deve ser uma string");
//       }
//       const resultUser = users.find((user) => user.id === newId);
//       if (resultUser) {
//         res.status(400);
//         throw new Error("Esse id já existe");
//       }
//     }

//     if (newName !== undefined) {
//       if (typeof newName !== "string") {
//         res.status(400);
//         throw new Error("'name' inválido. Deve ser uma string");
//       }
//       if (newName.length < 2) {
//         res.status(400);
//         throw new Error("'name' inválido. Deve ter no mínimo 2 caracteres");
//       }
//     }

//     if (newEmail !== undefined) {
//       if (typeof newEmail !== "string") {
//         res.status(400);
//         throw new Error("'email' inválido. Deve ser uma string");
//       }
//       const resultEmail = users.find((user) => user.email === newEmail);
//       if (resultEmail) {
//         res.status(400);
//         throw new Error("Esse e-mail já existe");
//       }
//     }

//     if (newPassword !== undefined) {
//       if (typeof newPassword !== "string") {
//         res.statusCode = 400;
//         throw new Error("'password' inválido. Deve ser uma string");
//       }
//       if (
//         !newPassword.match(
//           /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
//         )
//       ) {
//         res.statusCode = 400;
//         throw new Error(
//           "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas, no mínimo um número e um caractere especial"
//         );
//       }
//     }

//     // const [putUser] = await db.raw(`
//     //   SELECT * FROM users
//     //   WHERE id = "${idToEdit}"
//     // `);

//     const [user] = await db("users").where({ id: idToEdit });

//     if (user) {
//       const updatedUser = {
//         id: newId || user.id,
//         name: newName || user.name,
//         email: newEmail || user.email,
//         password: newPassword || user.password,
//       };
//       await db("users").update(updatedUser).where({ id: idToEdit });
//     } else {
//       res.status(404);
//       throw new Error("Usuário não encontrado");
//     }

//     // if (user < 0) {
//     //   res.status(404);
//     //   throw new Error("Usuário não encontrado");
//     // }

//     // const newQuery: string = query.join(", ");
//     // console.log(newQuery);

//     // await db.raw(`
//     //   UPDATE users
//     //   SET ${newQuery}
//     //   WHERE id = "${idToEdit}"
//     // `);
//     res.status(201).send("Informações atualizadas com scesso!");
//   } catch (error) {
//     if (res.statusCode === 200) {
//       // se acima der resultado o status 200 (que não deu erro), como ele vai ser pego no catch, tem que alterar de 200 para 500
//       res.status(500); //erro inesperado
//     }

//     if (error instanceof Error) {
//       //se der o erro 400
//       res.send(error.message); // manda a mensagem
//     } else {
//       // senão for uma instância do erro 400, manda
//       res.send("Erro inesperado"); // a mensagem do erro 500
//     }
//   }
// });
