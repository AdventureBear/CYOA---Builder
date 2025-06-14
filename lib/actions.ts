"use server";
import { db } from "@/lib/db";
import { users } from "@/db/schema";


export async function createUser(name: string, email: string) {
    await db.insert(users).values({ name, email });
}

export async function getUsers() {
    return await db.select().from(users);
}

export async function updateUser(id: number, name: string, email: string) {
    await db.update(users).set({ name, email }).where(users.id.equals(id));
}

