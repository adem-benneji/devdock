package com.devtools.tools;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class ToolsServiceApplication {
  public static void main(String[] args) throws Exception {
    if (args.length == 2 && args[0].equals("--worker")) {
      com.devtools.tools.execution.WorkerMain.main(new String[] {args[1]});
    } else SpringApplication.run(ToolsServiceApplication.class, args);
  }
}
