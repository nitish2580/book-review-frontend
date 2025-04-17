const mongoose = require('mongoose');
const Book = require('./models/book'); // Adjust path as needed
const faker = require('faker');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/yourdbname', {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

// Genre list
const genres = [
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




// Generate mock books
const generateMockBooks = async (count = 50) => {
    const books = [];

    for (let i = 0; i < count; i++) {
        const title = faker.random.words(faker.random.number({ min: 1, max: 5 }));
        const author = faker.random.arrayElement(authors);
        const genre = faker.random.arrayElement(genres);
        const publishedYear = faker.random.number({ min: 1900, max: 2023 });
        const price = faker.random.number({ min: 5, max: 50, precision: 0.01 });

        books.push({
            title,
            author,
            genre,
            description: faker.lorem.paragraph(),
            publishedYear,
            isbn: faker.random.alphaNumeric(13),
            price,
            createdAt: faker.date.past(10),
            updatedAt: faker.date.recent()
        });
    }

    try {
        await Book.insertMany(books);
        console.log(`${count} books inserted successfully`);
        mongoose.connection.close();
    } catch (err) {
        console.error('Error inserting books:', err);
        mongoose.connection.close();
    }
};

// Clear existing data and generate new mock data
const seedDatabase = async () => {
    try {
        await Book.deleteMany({});
        console.log('Existing books deleted');
        await generateMockBooks(50);
    } catch (err) {
        console.error('Error seeding database:', err);
        mongoose.connection.close();
    }
};

seedDatabase();