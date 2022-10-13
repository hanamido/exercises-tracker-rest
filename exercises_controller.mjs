import 'dotenv/config';
import * as exercises from './exercises_model.mjs';
import express from 'express';
import {body, validationResult} from 'express-validator';

const PORT = process.env.PORT;

const app = express();

app.use(express.json());

/**
 * Add a new exercise with the specified name, reps, weight, unit, & date in the body.
 * Validates entry before sending response. 
 */
app.post(
    '/exercises', 
    // Validate data inputted in POST request
    body('name').isLength({ min: 1}), body('name').isString(),
    body('reps').isInt({ min: 1 }),
    body('weight').isInt({ min: 1 }),
    body('unit').isIn(["kgs", "lbs"]), 
    body('date').isDate({format: 'MM-DD-YY', strictMode: true, delimiters: ['-']}), 
    (req, res) => {
        const errors = validationResult(req);
        // Check that content of date entered is valid
        if (!checkDateEntered(String(body('date')))) {
           errors.array().push("invalid")
        }; 
        if (!errors.isEmpty()) {
            // for debugging purposes
            // return res.status(400).json({ errors: errors.array()})
            return res.status(400).json({ Error: "Invalid Request" });
        } 
        exercises.createExercise(req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date) 
        // created new exercise document successfully
        .then (exercise => {
            res.status(201).json(exercise);
        })
        // else return an error
        .catch (error => {
            console.error(error);
            res.status(400).json({Error: 'Invalid Request'});
        });
    }
);

/**
 * Checks string date entered to see if it is valid. 
 * @param {String} strDate 
 * @returns A boolean value indicating if date is valid or not. 
 */
function checkDateEntered(strDate) {
    const dateStringArr = strDate.split('-');
    let month = parseInt(dateStringArr[0]);
    let day = parseInt(dateStringArr[1]);
    let year = parseInt(dateStringArr[2]);
    // Define months with 31 days, 30 days, and 28 days
    let months31Days = [1, 3, 5, 7, 8, 10, 12];
    let months30Days = [4, 6, 9, 11];
    let months28Days = [2];
    
    let isLeap = ((year % 4 === 0) && (year % 100 !== 0)) || (year % 400 === 0);
    let isValid = (months31Days.indexOf(month) !== -1 && day <= 31) || 
        (months30Days.indexOf(month) !== -1 && day <= 30) || (months28Days.indexOf(month) !== -1 && day <= 28) 
        || (months28Days.indexOf(month) !== -1 && day <= 29 && isLeap);
        return isValid;  // returns Boolean value if date is valid
};

/**
 * Retrieve all the exercises currently in the database
 */
app.get('/exercises', (req, res) => {
    let filter = {};
    exercises.findExercises(filter, '', 0)
        .then(exercise => {
            if (exercise !== null) {
                res.status(200).json(exercise)
            } else {
                res.status(404).json({ Error: 'Not Found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({ Error: 'Request failed' })
        });
});

/**
 * Gets the exercise corresponding to ID provided as path parameters in URL. 
 */
app.get('/exercises/:_id', (req, res) => {
    const exerciseId = req.params._id;
    exercises.findExerciseById(exerciseId)
        .then(exercise => {
            if (exercise !== null) {
                res.status(200).json(exercise)
            } else {
                res.status(404).json({ Error: 'Not Found'});
            }
        })
        .catch (error => {
            console.error(error); 
            res.status(404).json({ Error: 'Invalid request' })
        });
});

/**
 * Update the movie with specified ID in the path parameter, and set its 
 * name, rep, weight, unit, & date to the value(s) provided in the body. 
 */
app.put('/exercises/:_id',         
    // Validate data inputted in PUT request
    body('name').isLength({ min: 1}), body('name').isString(),
    body('reps').isInt({ min: 1 }),
    body('weight').isInt({ min: 1 }),
    body('unit').isString(), body('unit').isIn(["kgs", "lbs"]), 
    body('date').isDate({format: 'MM-DD-YY', strictMode: true, delimiters: ['-']}), 
    (req, res) => {
        const errors = validationResult(req);
        // Check that content of date entered is valid
        if (!checkDateEntered(String(body('date')))) {
            errors.array().push("invalid")
        }; 
        if (!errors.isEmpty()) {
            // if request body is invalid, return error response code
            return res.status(400).json({ Error: "Invalid Request" });
        } 
        exercises.replaceExercise(req.params._id, req.body.name, req.body.reps, req.body.weight, req.body.unit, req.body.date)
            .then (numUpdated => {
                if (numUpdated === 1) {
                    res.json({ id: req.params._id, name: req.body.name, reps: req.body.reps, weight: req.body.weight, unit: req.body.unit, date: req.body.date});
                } else {
                    // Return an error if id is not found
                    res.status(404).json({ Error: "Not Found"});
                }
            })
            .catch (error => {
                console.error(error);
                res.status(400).json({Error: "Invalid Request"})
            });
    }
);

/**
 * Deletes a movie with the specified ID. 
 */
app.delete('/exercises/:_id', (req, res) => {
    exercises.deleteById(req.params._id)
        .then(deletedCount => {
            // Successful deletion of entry - status code 204
            if (deletedCount === 1) {
                res.status(204).json()
            } else {
                res.status(404).json({ Error: 'Not Found' });
            }
        })
        .catch(error => {
            console.error(error);
            res.status(400).json({Error: 'Invalid Request'});
        });
});

/**
 * Retrieve the exercise matching the specified ID. 
 */

app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}...`);
});