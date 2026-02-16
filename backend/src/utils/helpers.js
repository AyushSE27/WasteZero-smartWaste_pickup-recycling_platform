import { v4 as uuidv4 } from "uuid";

export const makeId = () => uuidv4();

export const publicUser = ({ password, _id, ...user }) => user;

export const nowISO = () => new Date().toISOString();
