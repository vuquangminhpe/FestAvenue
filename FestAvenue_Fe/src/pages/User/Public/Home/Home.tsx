import { getAccessTokenFromLS } from '@/utils/auth'
import * as signalR from '@microsoft/signalr'
export default function Home() {
  const connection = new signalR.HubConnectionBuilder()
    .withUrl('https://hoalacrent.io.vn/chathub', {
      accessTokenFactory: () => getAccessTokenFromLS() || ''
    })
    .build()

  connection.on('send', (data) => {
    console.log(data)
  })

  connection.start().then(() => connection.invoke('send', 'Hello'))
  return <div>Home</div>
}
