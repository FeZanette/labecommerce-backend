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
import { ProductsToBuy, TProduct, TPurchase, TPurchasesProducts, TUser } from "./types";
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

    const [userIdAlreadyExists]: TUser[] | undefined[] = await db(
      "users"
    ).where({ id: id });

    if (userIdAlreadyExists) {
      res.status(400);
      throw new Error("Esse id já existe");
    }

    const [userEmailAlreadyExists]: TUser[] | undefined[] = await db(
      "users"
    ).where({ email: email });

    if (userEmailAlreadyExists) {
      res.status(400);
      throw new Error("Esse email já existe");
    }

    const createAt = new Date().toISOString();

    const newUser = {
      id: id,
      name: name,
      email: email,
      password: password,
      created_at: createAt,
    };

    await db("users").insert(newUser);
    res.status(201).send({
      message: "Cadastro realizado com sucesso",
      user: newUser,
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
    const idToDelete = req.params.id;

    if (idToDelete[0] !== "u") {
      res.status(400);
      throw new Error("'id' deve iniciar com a letra 'u'");
    }

    const [userIdAlreadyExists]: TUser[] | undefined[] = await db(
      "users"
    ).where({ id: idToDelete });

    if (!userIdAlreadyExists) {
      res.status(404);
      throw new Error("Usuário não encontrado");
    }

    // POSSÍVEL REFATORAÇÃO PARA RECEBER CONSTRAINT FOREIGN KEY. VER QUAL A RELAÇÃO QUE VAI EXISTIR PARA DELETAR: SE COM O purchases.buyer OU COM O urchases_products.purchase_id
    // await db(purchases_products).del().where(puchase_id:idToDelete)
    await db("users").del().where({ id: idToDelete });

    res.status(200).send("Usuário deletado com sucesso");
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

// --  Edit User (não pedia para fazer esse endpoint) --

app.put("/users/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit = req.params.id;

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

    const [user]: TUser[] | undefined[] = await db("users").where({
      id: idToEdit,
    });

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
      throw new Error("'id' não encontrado");
    }

    res.status(201).send("Informações atualizadas com sucesso!");
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

// -- Get All Products --

app.get("/products", async (req: Request, res: Response) => {
  try {
    const nameToFind = req.query.name as string;

    if (nameToFind === undefined) {
      const result = await db("products");
      return res.status(200).send(result);
    } else {
      if (nameToFind.length < 1) {
        res.status(400);
        throw new Error("'name' inválido. Deve ter no mínimo 1 caractere");
      }
      const result: TProduct[] | undefined[] = await db("products")
        .where("name", "LIKE", `%${nameToFind}%`)
        .orWhere("description", "LIKE", `%${nameToFind}%`);

      // VER SE A SINTAXE ACIMA ESTÁ CORRETA, SENÃO DESCOMENTAR ESSE DE BAIXO:
      // if (nameToFind !== undefined) {
      //   if (nameToFind.length < 1) {
      //     res.status(400);
      //     throw new Error("'name' inválido. Deve ter no mínimo 1 caractere");
      //   }

      //   const result: TProduct[] | undefined[] = await db("products")
      //     .select()
      //     .where("name", "LIKE", `%${nameToFind}%`)
      //     .orWhere("description", "LIKE", `%${nameToFind}%`);

      return res.status(200).send(result);
    }

    const products: TProduct[] = await db("products");
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
    const id = req.body.id as string;
    const name = req.body.name as string;
    const price = req.body.price as number;
    const description = req.body.description as string;
    const imageUrl = req.body.imageUrl as string;

    // body usando desestruturação;
    // const { id, name, price, description, imageUrl } = req.body;

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

    const [productIdAlreadyExists]: TProduct[] | undefined[] = await db(
      "products"
    ).where({
      id: id,
    });
    if (productIdAlreadyExists) {
      res.status(400);
      throw new Error("Esse id já existe");
    }

    const [productNameAlreadyExists]: TProduct[] | undefined[] = await db(
      "products"
    ).where({ name: name });
    if (productNameAlreadyExists) {
      res.status(400);
      throw new Error("Esse nome já existe");
    }

    const newProduct = {
      id,
      name,
      price,
      description,
      image_url: imageUrl,
    };

    await db("products").insert(newProduct);
    const [insertedProduct] = await db("products").where({
      id: id,
    });

    res.status(201).send({
      message: "Produto cadastrado com sucesso",
      product: insertedProduct,
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

// Edit Product By Id:

app.put("/products/:id", async (req: Request, res: Response) => {
  try {
    const idToEdit = req.params.id;

    // body usando desestruturação;
    // const { id, name, price, description, imageUrl } = req.body;

    const newId = req.body.id;
    const newName = req.body.name;
    const newPrice = req.body.price;
    const newDescription = req.body.description;
    const newImageUrl = req.body.imageUrl;

    if (newId !== undefined) {
      if (typeof newId !== "string") {
        res.status(400);
        throw new Error("'id' inválido. Deve ser uma string");
      }
      if (newId.length < 4) {
        res.status(400);
        throw new Error("'id' inválido. Deve ter no mínimo 4 caracteres");
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

    if (newPrice !== undefined) {
      if (typeof newPrice !== "number") {
        res.status(400);
        throw new Error("'price' inválido. Deve ser uma number");
      }
    }

    if (newDescription !== undefined) {
      if (typeof newDescription !== "string") {
        res.status(400);
        throw new Error("'description' inválido. Deve ser uma string");
      }
      if (newDescription.length < 2) {
        res.status(400);
        throw new Error(
          "'description' inválido. Deve ter no mínimo 2 caracteres"
        );
      }
    }

    if (newImageUrl !== undefined) {
      if (typeof newImageUrl !== "string") {
        res.status(400);
        throw new Error("'imageUrl' inválido. Deve ser uma string");
      }
      if (newImageUrl.length < 2) {
        res.status(400);
        throw new Error("'imageUrl' inválido. Deve ter no mínimo 2 caracteres");
      }
    }

    const [product]: TProduct[] | undefined[] = await db("products").where({
      id: idToEdit,
    });

    if (product) {
      const updatedProduct = {
        id: newId || product.id,
        name: newName || product.name,
        price: newPrice || product.price,
        description: newDescription || product.description,
        image_url: newImageUrl || product.imageUrl,
      };
      await db("products").update(updatedProduct).where({ id: idToEdit });
    } else {
      res.status(404);
      throw new Error("'id' não encontrado");
    }
    res.status(201).send("Produto atualizado com sucesso");
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

    if (idToDelete[0] !== "p") {
      res.status(400);
      throw new Error("'id' deve iniciar com a letra 'p'");
    }

    const [productIdAlreadyExists]: TProduct[] | undefined[] = await db(
      "products"
    ).where({ id: idToDelete });

    if (!productIdAlreadyExists) {
      res.status(404);
      throw new Error("Produto não encontrado");
    }

    // POSSÍVEL REFATORAÇÃO PARA RECEBER CONSTRAINT FOREIGN KEY QUE TEM RELAÇÃO OU COM O purchases_products.product_id
    // await db(purchases_products).del().where(product_id:idToDelete)
    await db("products").del().where({ id: idToDelete });

    res.status(200).send("Produto apagado com sucesso");
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

    if (idToSearch[0] !== "p") {
      res.status(400);
      throw new Error("'id' deve iniciar com a letra 'p'");
    }

    const [purchaseIdAlreadyExists]: TPurchase[] | undefined[] = await db(
      "purchases"
    ).where({ id: idToSearch });

    if (!purchaseIdAlreadyExists) {
      res.status(404);
      throw new Error("'id' não encontrado");
    }

    if (purchaseIdAlreadyExists) {
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
        .select(
          "purchases_products.product_id AS id",
          "products.name AS name",
          "products.price AS price",
          "products.description AS description",
          "products.image_url AS imageUrl",
          "purchases_products.quantity AS quantity"
        )
        .from("purchases_products")
        .join("products", "purchases_products.product_id", "=", "products.id")
        .where({ "purchases_products.purchase_id": idToSearch });

      const purchaseInfo = {
        purchaseId: purchase.purchaseId,
        buyerId: purchase.buyerId,
        buyerName: purchase.buyerName,
        buyerEmail: purchase.buyerEmail,
        totalPrice: purchase.totalPrice,
        createdAt: purchase.createdAt,
        products: purchasesProducts,
      };

      res.status(200).send(purchaseInfo);
      return;
    }
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

app.post("/purchases", async (req: Request, res: Response) => {
  try {

    const id = req.body.id as string
        const buyer = req.body.buyer as string
        const products = req.body.products as ProductsToBuy[]

        if (!id || !buyer) {
            res.status(404)
            throw new Error("'id' ou 'buyer' devem ser obrigatórios")
        }

        if (!products || products.length === 0) {
            res.status(404)
            throw new Error("'products' deve ser obrigatório e não pode estar vazio")
        }

        if (typeof id !== "string" || typeof buyer !== "string") {
            res.status(404)
            throw new Error("'id' ou 'buyer' devem ser string")
        }

        if (id[0] !== "p") {
            res.status(404)
            throw new Error("'id' deve iniciar com a letra 'p'")
        }

        const [findId] = await db("purchases").where({ id })
        if (findId) {
            res.status(404)
            throw new Error("'id' já cadastrada")
        }

        const [findBuyer] = await db("users").where({ id: buyer })
        if (!findBuyer) {
            res.status(404)
            throw new Error("Usuário (buyer) não cadastrado")
        }

        products.map((product) => {
            if (!product.productId || typeof product.productId !== "string") {
                res.status(404)
                throw new Error("'id' do produto deve ser string")
            }

            if (!product.quantity || typeof product.quantity !== "number") {
                res.status(404)
                throw new Error("'quantity' deve ser number")
            }
        })

        for (const i in products) {
            const [findProduct] = await db("products").where({ id: products[i].productId })
            if (!findProduct) {
                res.status(404)
                throw new Error(`O produto ${products[i].productId} não foi encontrado`);
            }
        }

        for (const i in products) {
            const newPurchase = {
                purchase_id: id,
                product_id: products[i].productId,
                quantity: products[i].quantity
            }
            await db("purchases_products").insert(newPurchase)
        }

        const cart = await db("purchases_products").where({ purchase_id: id })
        let totalPrice = 0

        const newPurchase = {
            id: cart[0].purchase_id,
            buyer: buyer,
            total_price: totalPrice
        }

        for (const product of cart) {
            const [productInCart] = await db("products").where({ id: product.product_id })
            totalPrice += product.quantity * productInCart.price
        }

        newPurchase.total_price = totalPrice

        await db("purchases").insert(newPurchase)

        const purchasedProducts: {}[] = []
        for (const i of cart) {
            const [productInCart] = await db("products").where({ id: i.product_id })
            purchasedProducts.push({
                id: productInCart.id,
                name: productInCart.name,
                price: productInCart.price,
                description: productInCart.description,
                imageUrl: productInCart.image_url,
                quantity: i.quantity
            })
        }

        const [createdPurchased] = await db("purchases").where({ id })
        const styledPurchased = {
            id: createdPurchased.id,
            buyer: createdPurchased.buyer,
            totalPrice: createdPurchased.total_price,
            products: purchasedProducts
        }


        res.status(201).send({
            message: "Pedido cadastrado com sucesso!",
            purchased: styledPurchased
        })
    

    // const id = req.body.id as string;
    // const buyer = req.body.buyer as string;
    // const total_price = req.body.totalPrice as number;

    // if (id === undefined || buyer === undefined || total_price === undefined) {
    //   // verifica se todos os elementos do body estão sendo passados
    //   res.status(400);
    //   throw new Error(
    //     "O body precisa ter todos os atributos: 'id', 'name', 'email' e 'password'"
    //   );
    // }

    // if (id !== undefined) {
    //   if (typeof id !== "string") {
    //     res.status(400);
    //     throw new Error("'id' inválido. Deve ser uma string");
    //   }

    //   const resultUser = users.find((user) => user.id === id);
    //   if (resultUser) {
    //     res.status(400);
    //     throw new Error("Esse id já existe");
    //   }
    // }

    // if (buyer !== undefined) {
    //   if (typeof buyer !== "string") {
    //     res.status(400);
    //     throw new Error("'buyer' inválido. Deve ser uma string");
    //   }
    //   if (buyer.length < 2) {
    //     res.status(400);
    //     throw new Error("'buyer' inválido. Deve ter no mínimo 2 caracteres");
    //   }
    // }

    // if (email !== undefined) {
    //   if (typeof email !== "string") {
    //     res.status(400);
    //     throw new Error("'email' inválido. Deve ser uma string");
    //   }
    //   const resultEmail = users.find((user) => user.email === email);
    //   if (resultEmail) {
    //     res.status(400);
    //     throw new Error("Esse e-mail já existe");
    //   }
    // }

    // if (password !== undefined) {
    //   if (typeof password !== "string") {
    //     res.statusCode = 400;
    //     throw new Error("'password' inválido. Deve ser uma string");
    //   }
    //   if (
    //     !password.match(
    //       /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^\da-zA-Z]).{8,12}$/g
    //     )
    //   ) {
    //     res.statusCode = 400;
    //     throw new Error(
    //       "'password' deve possuir entre 8 e 12 caracteres, com letras maiúsculas e minúsculas, no mínimo um número e um caractere especial"
    //     );
    //   }
    // }
    // const createAt = new Date().toISOString();

    // const newUser = {
    //   id: id,
    //   name: name,
    //   email: email,
    //   password: password,
    //   created_at: createAt,
    // };
    // // await db.raw(`
    // //   INSERT INTO users (id, name, email, password, created_at)
    // //   VALUES ("${id}", "${name}", "${email}", "${password}", "${createAt}");
    // // `);

    // await db("users").insert(newUser);

    // res.status(201).send("Cadastro realizado com sucesso");
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

// -- Delete Purchase By Id --

app.delete("/purchases/:id", async (req: Request, res: Response) => {
  try {
    const idToDelete = req.params.id;

    if (idToDelete[0] !== "pur") {
      res.status(400);
      throw new Error("'id' deve iniciar com as letras 'pur'");
    }
    const [purchaseIdAlreadyExists] = await db("purchases").where({
      id: idToDelete,
    });

    if (!purchaseIdAlreadyExists) {
      res.status(404);
      throw new Error("'id' do pedido não encontrado");
    }

    await db("purchases_products").del().where({ purchase_id: idToDelete });
    await db("purchases").del().where({ id: idToDelete });

    res.status(200).send("Pedido apagado com sucesso");
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
