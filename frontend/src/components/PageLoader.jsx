import "./css/PageLoader.css";

const LETTERS = "THEFOLDER/".split("");

export default function PageLoader() {
  return (
    <div className="pl-screen" role="status" aria-label="Cargando">
      <div className="pl-word">
        {LETTERS.map((letter, i) => (
          <span key={i} className="pl-letter" style={{ "--i": i }}>
            {letter}
          </span>
        ))}
      </div>
    </div>
  );
}
