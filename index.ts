import app from "./src/server";
const port = 3000;

app.listen(port, () => {
  console.log(`Order book API running at http://localhost:${port}`);
});
