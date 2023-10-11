const express = require("express");
const mariadb = require("mariadb");
const app = express();
const port = 3000;

// Create a database connection pool
const pool = mariadb.createPool({
  host: "localhost",
  user: "root",
  password: "root",
  database: "sample",
  connectionLimit: 5,
});

// Middleware to parse JSON request bodies
app.use(express.json());

// Route 1: Retrieve all records from a table
app.get("/api/agents", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM agents");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release(); // Release the connection back to the pool
  }
});

// Route 2: Retrieve a specific record by ID
app.get("/api/orders/:id", async (req, res) => {
  let conn;
  const { id } = req.params;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM orders WHERE ORD_NUM = ?", [
      id,
    ]);
    if (rows.length === 0) {
      res.status(404).json({ error: "Record not found" });
    } else {
      res.json(rows[0]);
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Route 3: Retrieve all records from table2
app.get("/api/students", async (req, res) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const rows = await conn.query("SELECT * FROM student");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Route 4: Create a new record in the 'agents' table
app.post("/api/agents", async (req, res) => {
  let conn;
  const {
    AGENT_CODE,
    AGENT_NAME,
    WORKING_AREA,
    COMMISSION,
    PHONE_NO,
    COUNTRY,
  } = req.body;
  try {
    conn = await pool.getConnection();
    await conn.query(
      "INSERT INTO agents (AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY) VALUES (?, ?, ?, ?, ?, ?)",
      [AGENT_CODE, AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY]
    );
    res.status(201).json({ message: "Record created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Route 5: Update a specific record by AGENT_CODE in the 'agents' table
app.put("/api/agents/:agentCode", async (req, res) => {
  let conn;
  const { agentCode } = req.params;
  const { AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
  try {
    conn = await pool.getConnection();
    await conn.query(
      "UPDATE agents SET AGENT_NAME = ?, WORKING_AREA = ?, COMMISSION = ?, PHONE_NO = ?, COUNTRY = ? WHERE AGENT_CODE = ?",
      [AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY, agentCode]
    );
    res.json({ message: "Record updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Route 6: Partially update a specific record by AGENT_CODE in the 'agents' table
app.patch("/api/agents/:agentCode", async (req, res) => {
  let conn;
  const { agentCode } = req.params;
  const { AGENT_NAME, WORKING_AREA, COMMISSION, PHONE_NO, COUNTRY } = req.body;
  try {
    conn = await pool.getConnection();
    const updateValues = [];
    if (AGENT_NAME) updateValues.push(`AGENT_NAME = '${AGENT_NAME}'`);
    if (WORKING_AREA) updateValues.push(`WORKING_AREA = '${WORKING_AREA}'`);
    if (COMMISSION) updateValues.push(`COMMISSION = '${COMMISSION}'`);
    if (PHONE_NO) updateValues.push(`PHONE_NO = '${PHONE_NO}'`);
    if (COUNTRY) updateValues.push(`COUNTRY = '${COUNTRY}'`);
    if (updateValues.length === 0) {
      res.status(400).json({ error: "No valid fields to update" });
    } else {
      const updateQuery = `UPDATE agents SET ${updateValues.join(
        ", "
      )} WHERE AGENT_CODE = ?`;
      await conn.query(updateQuery, [agentCode]);
      res.json({ message: "Record updated successfully" });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

// Route 7: Delete a specific record by AGENT_CODE from the 'agents' table
app.delete("/api/agents/:agentCode", async (req, res) => {
  let conn;
  const { agentCode } = req.params;
  try {
    conn = await pool.getConnection();
    await conn.query("DELETE FROM agents WHERE AGENT_CODE = ?", [agentCode]);
    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (conn) conn.release();
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

// Define the /say endpoint
app.get("/say", async (req, res) => {
  try {
    const keyword = req.query.keyword;

    // Forward the request to your Google Cloud Function
    const response = await axios.get(
      "https://3lprnmub3c4qeguvbiu2pozrvq0dhtrl.lambda-url.us-east-2.on.aws/",
      {
        params: { keyword },
      }
    );

    // Return the response from the function
    res.send(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
