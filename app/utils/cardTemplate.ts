interface AccessCardTemplateProps {
  image: string;
  name: string;
  id?: string;
}

export const AccessCardTemplate = ({ image, name, id }: AccessCardTemplateProps) => {
  return {
    image,
    name,
    id
  };
}; 