import './App.css'
import useRouteElement from './useRouteElement'

function App() {
  const routeElement = useRouteElement()
  return <>{routeElement}</>
}

export default App
