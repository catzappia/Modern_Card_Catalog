import { User } from '../models/index.js';
import { signToken, AuthenticationError } from '../services/auth.js';

interface BookInput {
    bookId: string;
    authors: string[];
    description: string;
    title: string;
    image: string;
    link: string;
    }

const resolvers = {
    Query: {
        // get single user by either their id or their username
        user: async (_parent: any, { username }: { username: string }) => {
            const user = await User.findOne({ username });
            if (!user) {
                throw new AuthenticationError('Invalid credentials');
            }


            const token = signToken(user.username, user.password, user._id);
            return { token, user };
        }
    },
    Mutation: {
        // login a user, sign a token, and send it back
        login: async (_: any, { email, password }: { email: string, password: string }) => {
            const user = await User.findOne({ email });
            if (!user || !(await user.isCorrectPassword(password))) {
                throw new AuthenticationError('Invalid credentials');
            }

            const token = signToken(user.username, user.password, user._id);
            return { token, user };
        },
        // create a user, sign a token, and send it back
        addUser: async (_parent: any) => {
            return
        },
        // save a book to a user's `savedBooks` field by adding it to the set
        saveBook: async (_parent: any, { bookData }: { bookData: BookInput }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $addToSet: { savedBooks: bookData } },
                { new: true }
            );

            return updatedUser;
        },
        // remove a book from `savedBooks`
        removeBook: async (_: any, { bookId }: { bookId: string }, context: any) => {
            if (!context.user) {
                throw new AuthenticationError('You need to be logged in!');
            }

            const updatedUser = await User.findOneAndUpdate(
                { _id: context.user._id },
                { $pull: { savedBooks: { bookId } } },
                { new: true }
            );

            return updatedUser;
        }
    }
};

export default resolvers;