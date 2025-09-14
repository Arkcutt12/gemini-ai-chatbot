import { Chat } from "@/components/custom/chat";
import { generateUUID } from "@/lib/utils";

export default async function Page() {
  const id = generateUUID();
  
  const welcomeMessage = {
    id: "welcome",
    role: "assistant" as const,
    content: `¡Hola! Soy el **Agente Arkcutt**, tu especialista en corte láser. 

Puedo ayudarte con:

🎯 **Presupuestación** - Sube tu archivo DXF y obtén un presupuesto detallado
📋 **Consultas técnicas** - Información sobre materiales, capacidades y procesos
⚙️ **Generación DXF** - Crear archivos desde tus especificaciones

¿En qué te puedo ayudar hoy?`,
    createdAt: new Date(),
  };
  
  return <Chat key={id} id={id} initialMessages={[welcomeMessage]} />;
}
