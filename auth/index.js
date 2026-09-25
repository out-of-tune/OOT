const app = require('./app')
const settings = require('./settings')

app.listen(settings.PORT, () => console.log(`Server running on port ${settings.PORT}`))
