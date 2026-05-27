import FilmProvider from "./providers/FilmProvider";
import PromitaniProvider from "./providers/PromitaniProvider";
import Program from "./routes/Program";
import "./App.css";

function App() {
  return (
    <FilmProvider>
      <PromitaniProvider>
        <Program />
      </PromitaniProvider>
    </FilmProvider>
  );
}

export default App;
