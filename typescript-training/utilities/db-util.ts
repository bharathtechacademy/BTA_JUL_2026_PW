import config from '../config/config.json' with {type : 'json'};
import queries from '../queries/queries.json' with {type : 'json'};
import {Client} from 'pg';

export class DBCommons {

//common method to get the data from database
async getData(query : string) : Promise<Array<Object>>{

    //Create a configuration to connect with the database. 
    const dbConfig = new Client({
        host:config.db.host,
        port:config.db.port,
        user:config.db.user,
        password:config.db.password,
        database:config.db.database
    });

    //Connect with the database by using the above connection URL. 
    await dbConfig.connect();

    //Execute the query and store the db results in one variable. 
    const data = await dbConfig.query(query);

    //Close the database connection. 
    await dbConfig.end();

    //return the records received from the database. 
    return data.rows;

}

}

let obj = new DBCommons();
let dbData =await obj.getData(queries.get_all_categories);
console.log(dbData);
console.log(dbData[1].name==='Automation');