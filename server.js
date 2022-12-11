// New Server JavaScript file for Note Taker dealing with routes and pathing
const { randomUUID } = require('crypto');
const express = require('express');
const fs = require('fs');
const path = require('path');
console.log(__dirname);
const app = express();
const PORT = process.env.PORT || 3001; // Need to include process.env.PORT because Heroku can run on any port available - 3001 is for local use only

// Static Express to use the CSS files at all times, this gives the /notes path it's formatting!
app.use(express.static(path.join(__dirname, '/Develop/public')));


// Boiler Plate for Express Application
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// Performing .get for the notes page
app.get('/notes', (req,res) =>
    res.sendFile(path.join(__dirname,`/Develop/public/notes.html`))
);

// Get Request for api/notes and sending the Notes json back to the client
app.get('/api/notes', (req,res) =>
    res.sendFile(path.join(__dirname,`/Develop/db.json`))
);

// Post Method request - Taking information from client side then parsing to the notes object which is sent back via the get method to update the page
app.post('/api/notes', (req, res) => {
    console.log(`${req.method} confirmed`); // Confirming Post request was successful from Client End

    // Save JavaScript Object for storing Notes
    const { title, text, id} = req.body;

    // Checking that all fields are present
    if (title && text) {

        // Variable for the new note object that we will want to save
        const newNote = {
            title,
            text,
            id: randomUUID()
        };

        // // Converting data to a JSON string to save in JavaScript Object
        // const stringNote = JSON.stringify(newNote);

        // Obtain existing notes 
        fs.readFile('./Develop/db.json', 'utf-8', (err, data) => {
            if (err) {
                console.error(err)
            } else {
                // Converting string into JSON object
                const parsedNotes = JSON.parse(data);

                // Add review to parsed data
                parsedNotes.push(newNote);

               // Writing string to a file to save for persisitence - need to stringify it to write the string
                fs.writeFile(`./Develop/db.json`, JSON.stringify(parsedNotes, null, 4), 
                (err) =>
                    err 
                        ? console.error(err) 
                        : console.log(`Review for ${newNote.title} has been written to JSON file`)
                        );
            }
        })

        const response = {
            status: 'success',
            body: newNote
        };

        console.log(response);
        res.status(201).json(response);
    } else {
        res.status(500).json('Error in posting review');
    }
});

// Delete request attempt
app.delete('/api/notes/:id', (req, res) => { // We're deleting a specific note, so we need a route parameter 
    // the route parameter is :id which is a random id assigned to each note using the randomuuid function
    console.log(`${req.method} confirmed`)
    console.log(`${req.params.id}`);

    // Isolating the request params id 
    const selectedID = req.params.id;

    fs.readFile('./Develop/db.json', 'utf-8', (err, data) => {
        if (err) {
            console.error(err)
        } else {
            // Converting string into JSON object
            const parsedNotes = JSON.parse(data);

            // Filtering and removing the selected note to be deleted
            const adjustedNotes = parsedNotes.filter(parsedNotes => {
                return parsedNotes.id !== selectedID; // adjustedNotes is returning an array with all notes that don't contain the selectedID from the client
            });

           // Writing string to a file to save for persisitence
            fs.writeFile(`./Develop/db.json`, JSON.stringify(adjustedNotes, null, 4), 
            (err) =>
                err 
                    ? console.error(err) 
                    : console.log(`Review for ${selectedID} has been deleted.`)
                    );
        }
    })
})

// Get request for the specified id
app.get('/api/notes/:id', (req, res) => {
    console.log(`${req.params.id}`);
    res.send(`${req.params.id}`)
})

// Catch all for get request so you will alwasy be directed towards the index.html file
app.get('*', (req, res) => 
    res.sendFile(path.join(__dirname, `/Develop/public/index.html`))
);

app.listen(PORT, () => {
    console.log(`Note Taker app listening at http://localhost:${PORT}`);
})







