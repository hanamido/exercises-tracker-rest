import mongoose from 'mongoose';
import 'dotenv/config';

mongoose.connect(
    process.env.MONGODB_CONNECT_STRING,
    { useNewUrlParser: true }
); 

// Connect to the MongoDB database
const db = mongoose.connection; 

db.once("open", () => {
    console.log("Successfully connected to MongoDB using Mongoose!");
});


/**
 * Creates an exercise
 * @param {String} exerciseName 
 * @param {Number} reps 
 * @param {Number} weight 
 * @param {String} unit 
 * @param {String} date 
 * @returns A promise; resolves to the JSON object for the document created by calling save. 
 */
const createExercise = async (name, reps, weight, unit, date) => {
    // Create instance of model class Exercise
    const exercise = new Exercise( { name: name, reps: reps, weight: weight, unit: unit, date: date} );
    return exercise.save();
};


/**
 * Retrieve all the exercises currently in the colletion. 
 * @param {Object} filter 
 * @returns An array with all the elements. 
 */
const findExercises = async (filter) => {
    const query = Exercise.find(filter)
    return query.exec();
}


/**
 * Finds the exercise with the specified ID value. 
 * @param {String} _id 
 * @returns Object of the Exercise associated with the ID. 
 */
const findExerciseById = async (_id) => {
    const query = Exercise.findById(_id)
    return query.exec();
}; 

/**
 * Updates the exercise with the provided filter
 * @param {String} filter 
 * @param {*} update 
 * @returns 
 */
const updateExercise = async (filter, update) => {
    const result = await Exercise.updateOne(filter, update);
    return result.modifiedCount;
};

/**
 * Replace the name, reps, weight, unit, or date properties of the movie with the ID value provided. 
 * @param {String} _id 
 * @param {String} name 
 * @param {Number} reps 
 * @param {Number} weight 
 * @param {String} unit 
 * @param {String} date 
 * @returns A promise that resolves to the number of documents modified. 
 */
const replaceExercise = async (_id, name, reps, weight, unit, date) => {
    const result = await Exercise.updateOne({_id: _id}, { name: name, reps: reps, weight: weight, unit: unit, date: date});
    if (result.matchedCount === 0) {
        return result.matchedCount
    }
    return result.modifiedCount; 
}; 

/** 
 * Deletes an exercise with the specified ID. 
 * @param {String} _id
 * @returns A promise that resolves to the number of documents deleted. 
*/
const deleteById = async (_id) => {
    const result = await Exercise.deleteOne({_id: _id});
    return result.deletedCount;
};

/**
 * Defines the schema. 
 */
const ExerciseSchema = mongoose.Schema({
    name: { type: String, required: true },
    reps: { type: Number, required: true },   
    weight: { type: Number, required: true },
    unit: { type: String, required: true },
    date: {type: String, required: true }
});

// Compile model from the schema
const Exercise = mongoose.model("Exercise", ExerciseSchema);

export { createExercise, findExercises, findExerciseById, replaceExercise, deleteById };