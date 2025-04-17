const { MONGO_COLLECTION } = require("../lib/Enums");

const userSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["name", "email", "passwordHash", "role", "createdAt", "updatedAt"],
            properties: {
                name: { bsonType: "string" },
                email: { bsonType: "string", pattern: "^.+@.+\\..+$" },
                passwordHash: { bsonType: "string" },
                avatarUrl: { bsonType: "string" },
                bio: { bsonType: "string" },
                role: { enum: ["user", "admin"] },
                createdAt: { bsonType: "date" },
                updatedAt: { bsonType: "date" }
            }
        }
    }
}

const bookSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: [
                "title", "author", "description", "publishedYear",
                "isbn", "genreCount", "pageCount", "genres",
                "rating", "reviewCount", "coverUrl", "price",
                "createdAt", "updatedAt"
            ],
            properties: {
                title: { bsonType: "string" },
                author: { bsonType: "string" },
                description: { bsonType: "string" },
                publishedYear: { bsonType: "int" },
                isbn: { bsonType: "string" },
                genreCount: { bsonType: "int" },
                pageCount: { bsonType: "int" },
                genres: { bsonType: "array", items: { bsonType: "string" } },
                rating: { bsonType: "int", minimum: 1, maximum: 5 },
                reviewCount: { bsonType: "int" },
                coverUrl: { bsonType: "string" },
                price: { bsonType: "double" },
                createdAt: { bsonType: "date" },
                updatedAt: { bsonType: "date" }
            }
        }
    }
}

const reviewSchema = {
    validator: {
        $jsonSchema: {
            bsonType: "object",
            required: ["bookId", "userId", "rating", "title", "content", "createdAt", "updatedAt"],
            properties: {
                bookId: { bsonType: "objectId" },
                userId: { bsonType: "objectId" },
                rating: { bsonType: "int", minimum: 1, maximum: 5 },
                title: { bsonType: "string" },
                content: { bsonType: "string" },
                likes: { bsonType: "array", items: { bsonType: "objectId" } },
                createdAt: { bsonType: "date" },
                updatedAt: { bsonType: "date" }
            }
        }
    }
}

const collectionsMapper = {
    "users": userSchema,
    "reviews": reviewSchema,
    "books": bookSchema,
}

const createAllCollections = async (db) => {
    await Promise.all(
        Object.entries(collectionsMapper).map(async ([collectionName, options]) => {
            const existingCollections = await db.listCollections({ name: collectionName }).toArray();
            if (existingCollections.length === 0) {
                await db.createCollection(collectionName, {
                    ...options,
                    validationLevel: "strict",
                    validationAction: "error"
                });
                console.log(`✅ Created collection: ${collectionName}`);
            } else {
                console.log(`ℹ️ Collection already exists: ${collectionName}`);
            }
        })
    );
};

module.exports = {
    createAllCollections,
};