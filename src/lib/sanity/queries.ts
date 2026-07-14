export const landingPageQuery = `*[_type == "landingPage" && _id == "landingPage"][0] {
  hero, sectionCopy, processSteps, contact
}`;

export const servicesQuery = `*[_type == "service" && enabled == true] | order(order asc) {
  _id, title, tier, description, features, order
}`;

export const offersQuery = `*[_type == "offer" && enabled == true] | order(order asc) {
  _id, title, displayVariant, enabled, order, description, price, note, features, included, excluded, cta, featured
}`;

export const teamQuery = `*[_type == "teamMember" && enabled == true] | order(order asc) {
  _id, name, role, bio, tags, "image": {"asset": {"url": image.asset->url}, "alt": image.alt}, order
}`;

export const faqQuery = `*[_type == "faq" && enabled == true] | order(order asc) { _id, question, answer, order }`;

export const resourcesQuery = `*[_type == "resource" && defined(title) && defined(excerpt) && defined(category) && defined(publishedAt) && dateTime(publishedAt) <= now() && defined(slug.current) && defined(coverImage.asset) && defined(coverImage.alt) && defined(body) && count(body) > 0 && defined(seo.title) && defined(seo.description)] | order(publishedAt desc) {
  _id, resourceType, title, "slug": slug.current, excerpt, category, publishedAt,
  "coverImage": {"asset": {"url": coverImage.asset->url}, "alt": coverImage.alt},
  "body": body[]{..., _type == "imageWithAlt" => {"asset": {"url": asset->url}, "alt": alt}}, seo, action
}`;
