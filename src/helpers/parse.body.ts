import { RawData } from "ws";
import { MessageBody } from "./types";
  
export const parseBody = (data: RawData): MessageBody | undefined => {
  try {
    const body = JSON.parse(data.toString()) as MessageBody;
    if (body.data) {
      body.data = JSON.parse(body.data);
    }
    return body;
  } catch (error) {
    return undefined;
  }
}