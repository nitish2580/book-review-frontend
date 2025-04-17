const { insertRecords } = require("./mongo.client");
const {faker} = require("@faker-js/faker");

const { MONGO_COLLECTION: { BOOKS } } = require("../lib/Enums")

const allgenres = [
    'Fiction', 'Non-Fiction', 'Science Fiction', 'Fantasy',
    'Mystery', 'Romance', 'Biography', 'History',
    'Thriller', 'Horror', 'Self-Help', 'Science',
    'Poetry', 'Drama', 'Young Adult', 'Children'
];

// Author list
const authors = [
    'J.K. Rowling', 'Stephen King', 'George R.R. Martin', 'Agatha Christie',
    'Dan Brown', 'J.R.R. Tolkien', 'Harper Lee', 'Jane Austen',
    'Mark Twain', 'Ernest Hemingway', 'F. Scott Fitzgerald', 'Leo Tolstoy',
    'Charles Dickens', 'Virginia Woolf', 'Toni Morrison', 'Margaret Atwood',
    'Neil Gaiman', 'John Grisham', 'James Patterson', 'Suzanne Collins'
];

const generateSafeRating = () => {
    // Generate between 1.0-4.9 (allows rounding up to 5.0)
    const base = faker.number.float({
        min: 1.0,
        max: 4.9,
        precision: 0.01
    });

    // Round to nearest 0.5 increment (produces ratings like 3.0, 3.5, 4.0 etc.)
    const rounded = Math.round(base * 2) / 2;

    // Final clamp (shouldn't be needed but ensures safety)
    return Math.min(rounded, 5.0);
};


const generateMockBooks = async (monogClient, count = 50) => {
    const books = [];

    for (let i = 0; i < count; i++) {
        const title = faker.lorem.words({ min: 1, max: 5 });
        const author = faker.helpers.arrayElement(authors);
        const publishedYear = faker.number.int({ min: 1900, max: 2023 });
        const price = faker.number.float({ min: 5, max: 50, precision: 0.01 });
        const genreCount = faker.number.int({ min: 1, max: 3 });
        const genres = faker.helpers.arrayElements(allgenres, genreCount);
        let pageCount;
        if (genres.includes('Poetry')) {
            pageCount = faker.number.int({ min: 50, max: 150 }); 
        } else if (genres.includes('Children')) {
            pageCount = faker.number.int({ min: 20, max: 100 }); 
        } else if (genres.includes('Science Fiction') || genres.includes('Fantasy')) {
            pageCount = faker.number.int({ min: 300, max: 800 });
        } else {
            pageCount = faker.number.int({ min: 150, max: 400 });
        }

        books.push({
            title,
            author,
            description: faker.lorem.paragraph(),
            publishedYear,
            isbn: faker.string.alphanumeric(13),
            genreCount,
            pageCount,
            genres,
            rating: generateSafeRating(),
            reviewCount: faker.number.int({ min: 0, max: 1000 }),
            coverUrl: "/placeholder.svg?height=300&width=200",
            price,
            createdAt: faker.date.past(10),
            updatedAt: faker.date.recent()
        });
    }

    try {
        await insertRecords(monogClient, BOOKS, books);
    } catch (err) {
        console.error('Error inserting books:', err);
        throw new Error(err);
    }
};

module.exports = {
    generateMockBooks,
}