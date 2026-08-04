export const landingPageQuery = `*[_type == "landingPage" && _id == "landingPage"][0] {
  hero, sectionCopy { services, process, team, resources, faq }, processSteps, contact
}`;

export const siteSettingsQuery = `*[_type == "siteSettings" && _id == "siteSettings"][0] {
  name, description, corporateContact {
    email, whatsappNumber, socialProfiles[] { platform, url }
  }
}`;

export const servicesQuery = `*[_type == "service" && enabled == true] | order(order asc) {
  _id, title, tier, description, features, order
}`;

export const offersQuery = `*[_type == "offer" && enabled == true] | order(order asc) {
  _id, title, displayVariant, enabled, order, description, publicPrice, note, features, included, excluded, cta { label }, featured
}`;

export const teamQuery = `*[_type == "teamMember" && enabled == true] | order(order asc) {
  _id, name, role, bio, tags, "image": {"asset": image.asset->{url, metadata {dimensions}}, "alt": image.alt}, order
}`;

export const faqQuery = `*[_type == "faq" && enabled == true] | order(order asc) { _id, question, answer, order }`;

export const resourcesQuery = `*[_type == "resource" && defined(title) && defined(excerpt) && defined(category) && defined(publishedAt) && publishedAt <= now() && defined(slug.current) && defined(coverImage.asset) && defined(coverImage.alt) && defined(body) && count(body) > 0 && defined(seo.title) && defined(seo.description)] | order(publishedAt desc) {
  _id, _updatedAt, resourceType, title, "slug": slug.current, excerpt, category, publishedAt, authorName,
  "coverImage": {"asset": coverImage.asset->{url, metadata {dimensions}}, "alt": coverImage.alt},
  "body": body[]{..., _type == "imageWithAlt" => {"asset": asset->{url, metadata {dimensions}}, "alt": alt}}, seo, action
}`;
