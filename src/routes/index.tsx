import { createFileRoute } from "@tanstack/react-router";
import { Shopmate } from '@/features/shopmate/Shopmate';
export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: 'Shopmate — Your shop. Your next chapter.' },
    { name: 'description', content: 'Understand your shop’s trends, test a lunch bundle, and find the right mentor with Shopmate.' },
    { property: 'og:title', content: 'Shopmate — Small steps, stronger shops' },
    { property: 'og:description', content: 'A guided journey from shop insights to practical action and mentor support.' },
    { property: 'og:type', content: 'website' },
    { name: 'twitter:card', content: 'summary_large_image' },
  ] }),
  component: Shopmate,
});
