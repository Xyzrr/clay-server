import { SocketIOConnection } from "@slate-collaborative/backend";
import { SocketIOCollaborationOptions } from "@slate-collaborative/backend/lib/SocketIOConnection";
import { query } from "./db/index";
import express from "express";
import path from "path";

const PORT = process.env.PORT || 5000;

const server = express()
  .use(express.static(path.join(__dirname, "../public")))
  .set("views", path.join(__dirname, "views"))
  .set("view engine", "ejs")
  .get("/", (req, res) => res.render("pages/index"))
  .listen(PORT, () => console.log(`Listening on ${PORT}`));

const defaultValue = [
  {
    type: "paragraph",
    children: [
      {
        text: "Hello collaborator!",
      },
    ],
  },
];

const config: SocketIOCollaborationOptions = {
  entry: server, // or specify port to start io server
  defaultValue,
  saveFrequency: 2000,
  onAuthRequest: async (query, socket) => {
    // some query validation
    return true;
  },
  onDocumentLoad: async (pathname) => {
    // request initial document ValueJSON by pathname
    console.log("querying");

    const result = await query(
      `SELECT id, type, content FROM documents WHERE id=$1;`,
      [1]
    );

    console.log("result", result);

    if (result.rows.length === 0) {
      return defaultValue;
    }

    return result.rows[0].content.blocks;
  },
  onDocumentSave: async (pathname, doc) => {
    console.log("saving", doc);
    query(
      `INSERT INTO documents (id, type, content) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET type = $2, content = $3;`,
      [1, "text", { blocks: doc }]
    );
  },
};

const connection = new SocketIOConnection(config);
