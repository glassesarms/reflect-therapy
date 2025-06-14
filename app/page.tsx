export default function HomePage() {
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Welcome to Reflect Therapy</h1>
      <p>
        Reflect Therapy provides compassionate, professional therapy services.
      </p>
      <p className="mt-4">
        Contact us at <a href="mailto:info@reflect.example" className="underline text-blue-700">info@reflect.example</a>
        {' '}or call <a href="tel:+123456789">+1&nbsp;234&nbsp;567&nbsp;89</a>.
      </p>
      <p className="mt-4">
        <a href="/booking" className="text-blue-700 underline">Book a session</a>
      </p>
    </main>
  );
}
