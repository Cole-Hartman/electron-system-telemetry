import { useState, useEffect } from 'react'
import { BaseChart } from './BaseChart.tsx'
import { useStatistics } from './useStatistics.ts'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const statistics = useStatistics(100);

  return (
    <>
      <section id="center">
        hello
      </section>
      <section id="spacer"></section>
    </>
  )
}

export default App
