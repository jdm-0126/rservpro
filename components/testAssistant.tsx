import React, { createContext, useCallback, useEffect, useMemo, useRef } from 'react'

const testAssistant = () => {
  useEffect(() => {
    const timer= setInterval(() => {}, 1000);
        return() => clearInterval(timer);
  }, []);

  const users: any= [];

  const filtered = useMemo(() => {
    return users.filter((u: any) => u.active);
  }, [users]);


  const handleClick = useCallback(()=> {
  console.log("clicked");
},[]);


const inputRef = useRef<HTMLInputElement>(null)

const userContext = createContext(null);

  return (
      <div>
        <button onClick={handleClick}>Click me</button>
      </div>
  )
}

export default testAssistant


