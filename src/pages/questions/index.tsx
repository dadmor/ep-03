import { Route } from "react-router";
import { QuestionsManage } from "./manage";

export { QuestionsManage } from "./manage";

export const questionsRoutes = [
  <Route key="questions-manage" path="/questions/manage/:activityId" element={<QuestionsManage />} />,
];