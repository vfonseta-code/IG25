var raytraceFS = `
struct Ray {
	vec3 pos;
	vec3 dir;
};

struct Material {
	vec3  k_d;	// diffuse coefficient
	vec3  k_s;	// specular coefficient
	float n;	// specular exponent
};

struct Sphere {
	vec3     center;
	float    radius;
	Material mtl;
};

struct Light {
	vec3 position;
	vec3 intensity;
};

struct HitInfo {
	float    t;
	vec3     position;
	vec3     normal;
	Material mtl;
};

uniform Sphere spheres[ NUM_SPHERES ];
uniform Light  lights [ NUM_LIGHTS  ];
uniform samplerCube envMap;
uniform int bounceLimit;

bool IntersectRay( inout HitInfo hit, Ray ray );

// Shades the given point and returns the computed color.
vec3 Shade( Material mtl, vec3 position, vec3 normal, vec3 view )
{
	vec3 color = vec3(0,0,0);
	for ( int i=0; i<NUM_LIGHTS; ++i ) {
		// TO-DO: Check for shadows
		// TO-DO: If not shadowed, perform shading using the Blinn model
		// If the ray hits something before reaching the light the point is in shadow

 		// light direction and distance
		vec3 lightVec = lights[i].position - position;
		vec3 lightDir = normalize(lightVec);
		Ray shadowRay;
		shadowRay.pos = position + 1e-4 * lightDir; // offset to avoid self-shadowing
		shadowRay.dir = lightDir;
		HitInfo shadowHit;
		if (IntersectRay(shadowHit, shadowRay))
			continue; // In shadow 

		// Blinn model
		vec3 L = lightDir;
		vec3 V = normalize(view);             // Direction to eye
		vec3 H = normalize(L + V);            // Halfway vector

		float NdotL = max(dot(normal, L), 0.0);
		float NdotH = max(dot(normal, H), 0.0);

		vec3 diffuse  = mtl.k_d * lights[i].intensity * NdotL;
		vec3 specular = mtl.k_s * lights[i].intensity * pow(NdotH, mtl.n);

		color += diffuse + specular;
	}
	return color;
}

// Intersects the given ray with all spheres in the scene
// and updates the given HitInfo using the information of the sphere
// that first intersects with the ray.
// Returns true if an intersection is found.
bool IntersectRay( inout HitInfo hit, Ray ray )
{
	hit.t = 1e30;
	bool foundHit = false;
	float bias = 1e-4; // added by me 

	for ( int i=0; i<NUM_SPHERES; ++i ) {
		// TO-DO: Test for ray-sphere intersection
		Sphere currentSphere = spheres[i];

		vec3 rayDir = ray.dir;
		vec3 rayOrigin = ray.pos;
		vec3 sphereCenter = currentSphere.center;

		vec3 oc = rayOrigin - sphereCenter;

		float a = dot(rayDir, rayDir);
		float b = 2.0 * dot(rayDir, oc);
		float c = dot(oc, oc) - currentSphere.radius * currentSphere.radius;
		float delta = (b * b) - (4.0 * a * c);

		// TO-DO: If intersection is found, update the given HitInfo
		if(delta >= 0.0) {
			float sqrtD = sqrt(delta);
			float t = (-b - sqrtD) / (2.0 * a); // only need the smaller root for closest

			if (t > bias && t < hit.t) {
				hit.t = t;
				hit.position = rayOrigin + t * rayDir;
				hit.normal = normalize(hit.position - sphereCenter);
				hit.mtl = currentSphere.mtl;
				foundHit = true;
			}
		}
	}
	return foundHit;
}

// Given a ray, returns the shaded color where the ray intersects a sphere.
// If the ray does not hit a sphere, returns the environment color.
vec4 RayTracer( Ray ray )
{
	HitInfo hit;
	if ( IntersectRay( hit, ray ) ) {
		vec3 view = normalize( -ray.dir );
		vec3 clr = Shade( hit.mtl, hit.position, hit.normal, view );
		
		// Compute reflections
		vec3 k_s = hit.mtl.k_s;
		for ( int bounce=0; bounce<MAX_BOUNCES; ++bounce ) {
			if ( bounce >= bounceLimit ) break;
			if ( hit.mtl.k_s.r + hit.mtl.k_s.g + hit.mtl.k_s.b <= 0.0 ) break;
			
			Ray r;	// this is the reflection ray
			HitInfo h;	// reflection hit info
			
			// TO-DO: Initialize the reflection ray
			r.dir = 2.0 * dot(view, hit.normal) * hit.normal - view;
			r.pos = hit.position;
			
			if ( IntersectRay( h, r ) ) {
				// TO-DO: Hit found, so shade the hit point
				view = normalize( -r.dir );
				clr +=  k_s * Shade(h.mtl, h.position, h.normal, view);
				// TO-DO: Update the loop variables for tracing the next reflection ray
				hit = h;
				k_s = k_s * h.mtl.k_s;
			} else {
				// The refleciton ray did not intersect with anything,
				// so we are using the environment color
				clr += k_s * textureCube( envMap, r.dir.xzy ).rgb;
				break;	// no more reflections
			}
		}
		return vec4( clr, 1 );	// return the accumulated color, including the reflections
	} else {
		return vec4( textureCube( envMap, ray.dir.xzy ).rgb, 0 );	// return the environment color
	}
}
`;