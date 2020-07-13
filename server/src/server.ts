import express from 'express';

const app = express();

app.get('/users', (request, response) => {
    console.log('está funcionando');

    response.json([
        'Diego',
        'Cleiton',
        'Robson',
        "matheus"
    ]);
});

app.listen(3333);