export default function debug(message:string, level?:string) {
  if(!level) {
    level = "info";
  }
  if(level === "off") {
    return;
  } 
  console[level](message);
}