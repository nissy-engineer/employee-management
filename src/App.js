import './App.css';
import EmployeeList from './components/EmployeeList';

function App() {
  return (
    <div className="App">
      <EmployeeList />
    </div>
  );
}

export default App;


// import './App.css';
// import { useEffect, useState } from 'react';

// function App() {
//   const [message, setMessage] = useState('読み込み中...');

//   useEffect(() => {
//     // APIからデータを取得
//     fetch('http://localhost:5182/api/employees')
//       .then(response => response.text())
//       .then(data => setMessage(data));
//   }, []);

//   return (
//     <div>
//       <h1>社員情報管理システム</h1>
//       <p>{message}</p>
//     </div>
//   );
// }

// export default App;