import QuestionnaireClient from "./QuestionnaireClient";

type QuestionnairePageProps = {
  params: Promise<{ id: string }>;
};

export default async function QuestionnairePage({ params }: QuestionnairePageProps) {
  const { id } = await params;
  return <QuestionnaireClient universeId={id} />;
}

