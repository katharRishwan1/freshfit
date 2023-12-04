const { dotenv, app, morgan, cors, bodyParser, helment } = require("./app/services/imports");

dotenv.config();
const config = require("./app/config/config");
const responseHandler = require("./app/middlewares/response-handler");

//define the env values
dotenv.config();
//database connection
require('./connection')
app.use(responseHandler())
// adding morgan to log the http request
app.use(morgan('tiny'));

//enabling cors for all request
app.use(cors());

// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.json());

// adding Helmet to enhance your API's security
app.use(helment());
const router = require('./app/routes/__index');
app.use('/', router);
app.get("/demo", (req, res) => {
    return res.created({ msg: 'request access', statusCode: 200 })
});
app.listen(config.port, () => {
    console.log('server running on prot', config.port);
});