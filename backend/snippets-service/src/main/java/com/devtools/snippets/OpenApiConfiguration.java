package com.devtools.snippets;

import io.swagger.v3.core.converter.AnnotatedType;
import io.swagger.v3.core.converter.ModelConverters;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.media.*;
import io.swagger.v3.oas.models.responses.ApiResponse;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/** Add shared errors without overriding Spring's inferred success responses. */
@Configuration
public class OpenApiConfiguration {
  @Bean
  OpenApiCustomizer errorContract() {
    return api -> {
      if (api.getComponents() == null) api.setComponents(new Components());
      var resolved =
          ModelConverters.getInstance()
              .resolveAsResolvedSchema(new AnnotatedType(ApiErrors.Error.class).resolveAsRef(true));
      resolved.referencedSchemas.forEach(api.getComponents()::addSchemas);
      api.getPaths()
          .values()
          .forEach(
              path ->
                  path.readOperations()
                      .forEach(
                          operation -> {
                            operation
                                .getResponses()
                                .addApiResponse(
                                    "400",
                                    new ApiResponse()
                                        .description("Invalid request")
                                        .content(
                                            new Content()
                                                .addMediaType(
                                                    "application/json",
                                                    new MediaType()
                                                        .schema(
                                                            new Schema<>()
                                                                .$ref(
                                                                    "#/components/schemas/ApiError")))));
                          }));
    };
  }
}
