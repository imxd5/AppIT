const express = require('express')
const app = express()
const PORT = Number(process.env.PORT) || 3000;


const routes = require('./routes/index');

app.use(express.json())
app.use(express.static('public')); 


app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`🚀🌐 Server is running on http://localhost:${PORT}`);
});
