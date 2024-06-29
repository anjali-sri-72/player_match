let express = require("express");
let { open } = require("sqlite");
let sqlite3 = require("sqlite3");

let path = require("path");

let app = express();
app.use(express.json());

let dbPath = path.join(__dirname, "cricketMatchDetails.db");

let db = null;

let initializeDb = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });

    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDb();

//API 1

app.get("/players/", async (request, response) => {
  let query1 = `SELECT * FROM player_details`;
  let result1 = await db.all(query1);

  let b = [];

  for (let a of result1) {
    let { player_id, player_name } = a;
    let dbResponse = {
      playerId: player_id,
      playerName: player_name,
    };

    b.push(dbResponse);
  }
  response.send(b);
});

//API 2

app.get("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let query2 = `SELECT * FROM player_details WHERE player_id = ${playerId}`;
  let result2 = await db.get(query2);

  let { player_id, player_name } = result2;
  let dbResponse = {
    playerId: player_id,
    playerName: player_name,
  };
  response.send(dbResponse);
});

//API 3

app.put("/players/:playerId/", async (request, response) => {
  let { playerId } = request.params;
  let { playerName } = request.body;
  let query3 = `UPDATE player_details SET  
    player_name = '${playerName}' WHERE player_id = ${playerId};`;
  await db.run(query3);
  response.send("Player Details Updated");
});

//API 4

app.get("/matches/:matchId/", async (request, response) => {
  let { matchId } = request.params;
  let query4 = `SELECT * FROM match_details WHERE match_id = ${matchId}`;
  let result4 = await db.get(query4);
  let { match_id, match, year } = result4;
  let dbResponse = {
    matchId: match_id,
    match: match,
    year: year,
  };
  response.send(dbResponse);
});

//API 5

app.get("/players/:playerId/matches", async (request, response) => {
  let { playerId } = request.params;
  let query = `SELECT match_id
  FROM player_match_score WHERE player_id = ${playerId}`;
  let result = await db.get(query);

  let query5 = `SELECT * FROM match_details 
  WHERE match_id = ${result.match_id}`;
  let result5 = await db.all(query5);

  let b = [];

  for (let a of result5) {
    let { match_id, match, year } = a;
    let dbResponse = {
      matchId: match_id,
      match: match,
      year: year,
    };

    b.push(dbResponse);
  }
  response.send(b);
});

//API 6

app.get("/matches/:matchId/players", async (request, response) => {
  let { matchId } = request.params;
  let playerIdQuery = `SELECT player_id FROM player_match_score WHERE player_id = ${matchId}`;
  let playerIdResponse = await db.get(playerIdQuery);

  let query6 = `SELECT * FROM player_details 
  WHERE player_id = ${playerIdResponse.player_id}`;
  let result6 = await db.all(query6);

  let b = [];

  for (let a of result6) {
    let { player_id, player_name } = a;
    let dbResponse = {
      playerId: player_id,
      playerName: player_name,
    };

    b.push(dbResponse);
  }
  response.send(b);
});

//API 7

app.get("/players/:playerId/playerScores", async (request, response) => {
  let { playerId } = request.params;

  let query7 = `SELECT player_id, SUM(score) AS totalScore,
    SUM(fours) AS totalFours,
    SUM(sixes) AS totalSixes
    FROM player_match_score WHERE player_id = ${playerId}`;
  let result7 = await db.all(query7);
  response.send(result7);
});

module.exports = app;
