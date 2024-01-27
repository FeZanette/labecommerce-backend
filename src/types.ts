export type TUser = {
    id: string,
    name: string,
    email: string,
    password: string,
    created_at: string
}

export type TProduct = {
    id: string,
    name: string,
    price: number,
    description: string,
    imageUrl: string
}

export type TPurchase = {
    id: string,
    buyer: string,
    totalPrice: number,
    createdAt: string
}
