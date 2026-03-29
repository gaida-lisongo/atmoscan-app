export async function generateMetadata({ params }) {
  const { promotionId } = params;
  
  // Vous pouvez ici faire un appel API pour récupérer les détails de la promotion
  // const promotion = await fetch(`/api/promotions/${promotionId}`).then(res => res.json());
  
  return {
    title: `Promotion ${promotionId} - Dashboard Académique`,
    description: `Détails et gestion de la promotion ${promotionId}. Consultez les étudiants, les cours et les statistiques de cette promotion.`,
    keywords: ['promotion', 'étudiants', 'académique', 'gestion', 'dashboard'],
    openGraph: {
      title: `Promotion ${promotionId} - Dashboard Académique`,
      description: `Gestion et suivi de la promotion ${promotionId}`,
      type: 'website',
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary',
      title: `Promotion ${promotionId} - Dashboard Académique`,
      description: `Gestion et suivi de la promotion ${promotionId}`,
    },
    robots: {
      index: false, // Les pages de gestion ne doivent pas être indexées
      follow: false,
    }
  };
}

export default function PromotionLayout({ children, params }) {
  return (
    <>
      {children}
    </>
  );
}